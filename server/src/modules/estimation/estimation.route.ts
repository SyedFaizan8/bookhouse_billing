import { Router } from "express";
import { Response, Request } from "express";
import { prisma } from "../../prisma.js";
import { DocumentKind, FlowStatus } from "../../generated/prisma/enums.js";
import { CreateEstimationDTO } from "./estimation.schema.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";

const router = Router()

router.post("/new", asyncHandler(async (req: Request, res: Response) => {
    const parsed = CreateEstimationDTO.safeParse(req.body);

    if (!parsed.success) throw new AppError('Invalid request data', 400)

    const { schoolId, billedByUserId, notes, items, documentNo: userDocumentNo } = parsed.data;

    if (!items.length) throw new AppError('At least one item is required', 400)

    const round = (n: number) => Number(n.toFixed(2));

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError('No open academic year found', 404)

        /* =============================
           2️ DOCUMENT SEQUENCE
        ============================= */

        const seq = await tx.documentSequence.findUnique({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                },
            },
        });

        let finalNumber: number;

        if (userDocumentNo) {
            const userNo = Number(userDocumentNo);

            if (Number.isNaN(userNo) || userNo <= 0) {
                throw new Error("Invalid estimation number");
            }

            // 🔥 KEY LOGIC
            finalNumber = Math.max(seq?.lastNumber ?? 0, userNo);

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.ESTIMATION,
                    },
                },
                update: {
                    lastNumber: finalNumber,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    lastNumber: finalNumber,
                },
            });

        } else {
            // auto increment
            finalNumber = (seq?.lastNumber ?? 0) + 1;

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.ESTIMATION,
                    },
                },
                update: {
                    lastNumber: finalNumber,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    lastNumber: finalNumber,
                },
            });
        }


        /* ======================================================
           3. FLOW GROUP (CUSTOMER LEDGER GROUP)
        ====================================================== */

        let flowGroup = await tx.flowGroup.findFirst({
            where: {
                schoolId,
                academicYearId: academicYear.id,
                status: FlowStatus.OPEN,
            },
        });

        if (!flowGroup) {
            flowGroup = await tx.flowGroup.create({
                data: {
                    schoolId,
                    academicYearId: academicYear.id,
                    status: FlowStatus.OPEN,
                },
            });
        }

        /* ======================================================
           4. CALCULATIONS (SERVER = SOURCE OF TRUTH)
        ====================================================== */

        let totalQuantity = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const calculatedItems = items.map((item, index) => {
            if (!item.description?.trim()) throw new AppError(`Item ${index + 1}: Description is required`, 400)

            if (item.quantity <= 0) throw new AppError(`Item ${index + 1}: Quantity must be at least 1`, 400);

            const discountPercent = Math.min(Math.max(item.discountPercent, 0), 100);

            const gross = round(item.quantity * item.unitPrice);
            const discount = round((gross * discountPercent) / 100);
            const net = round(gross - discount);

            totalQuantity += item.quantity;
            grossAmount += gross;
            totalDiscount += discount;

            return {
                description: item.description.trim(),
                class: item.class ?? null,
                company: item.company ?? null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercent,
                grossAmount: gross,
                netAmount: net,
            };
        });

        const netAmount = round(grossAmount - totalDiscount);

        if (netAmount <= 0) throw new AppError("Total amount must be greater than zero", 409);

        /* ======================================================
           5. CREATE ESTIMATION DOCUMENT
        ====================================================== */

        const estimation = await tx.invoice.create({
            data: {
                documentNo: String(finalNumber),
                date: new Date(),
                kind: DocumentKind.ESTIMATION,

                flowGroupId: flowGroup.id,

                totalQuantity,
                grossAmount: round(grossAmount),
                totalDiscount: round(totalDiscount),
                netAmount,

                notes,
                billedByUserId,
            },
        });

        /* ======================================================
           6. CREATE ITEMS
        ====================================================== */

        await tx.item.createMany({
            data: calculatedItems.map((i) => ({
                ...i,
                invoiceId: estimation.id,
            })),
        });

        return estimation;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))


router.get("/:id", asyncHandler(async (req: Request, res: Response) => {

    const schoolId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('create academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const estimations = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                schoolId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.ESTIMATION
        },
        orderBy: {
            date: "desc",
        },
        select: {
            id: true,
            documentNo: true,
            date: true,
            totalQuantity: true,
            netAmount: true,
            createdAt: true,
        },
    });

    if (!estimations) throw new AppError('No Estimations found', 401)

    return res.json(
        estimations.map((est) => ({
            id: est.id,
            documentNo: est.documentNo,
            date: est.date,
            totalQty: est.totalQuantity,
            amount: est.netAmount.toNumber(),
            createdAt: est.createdAt,
        }))
    );
}))

export default router