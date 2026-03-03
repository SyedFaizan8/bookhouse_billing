import { Router } from "express";
import { Response, Request } from "express";
import { prisma } from "../../prisma.js";
import { AcademicYearStatus, DocumentKind, FlowStatus, SequenceScope } from "../../generated/prisma/enums.js";
import { CreateEstimationDTO, UpdateEstimationDTO } from "./estimation.schema.js";
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
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    scope: SequenceScope.SCHOOL,
                },
            },
        });

        const lastNumber = seq?.lastNumber ?? 0;
        const userNo = Number(userDocumentNo);

        if (!userNo || userNo <= 0) throw new AppError("Invalid estimation number", 409);

        /* ✅ 1. check duplicate */
        const exists = await tx.invoice.findFirst({
            where: {
                flowGroup: {
                    schoolId,
                    academicYearId: academicYear.id,
                },
                kind: DocumentKind.ESTIMATION,
                documentNo: String(userNo)
            }
        });

        if (exists) throw new AppError(`Estimation #${userNo} already exists`, 409);

        /* ✅ 2. enforce forward only */
        if (userNo <= lastNumber) throw new AppError(`Number must be greater than ${lastNumber}`, 409);

        /* ✅ 3. update sequence */
        await tx.documentSequence.upsert({
            where: {
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    scope: SequenceScope.SCHOOL,
                },
            },
            update: {
                lastNumber: userNo,
            },
            create: {
                academicYearId: academicYear.id,
                type: DocumentKind.ESTIMATION,
                scope: SequenceScope.SCHOOL,
                lastNumber: userNo,
            },
        });

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
                pending: item.quantity,
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
                documentNo: String(userNo),
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

    if (!academicYear) throw new AppError('open academic year first', 401)

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

router.post('/delete/:id', asyncHandler(async (req: Request, res: Response) => {
    const estimationId = req.params.id

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('open academic year first', 401)

    const estimation = await prisma.invoice.findFirst({
        where: {
            id: estimationId,
            kind: DocumentKind.ESTIMATION,
        },
        include: {
            flowGroup: {
                include: {
                    academicYear: true,
                },
            },
        },
    })

    if (!estimation)
        throw new AppError("Estimation not found", 404)

    // 🔒 Academic year lock
    if (estimation.flowGroup.academicYear.status !== AcademicYearStatus.OPEN)
        throw new AppError("Academic year is closed. Cannot delete estimation.", 403)

    // 🔒 Flow group lock
    if (estimation.flowGroup.status !== FlowStatus.OPEN)
        throw new AppError("Flow group is closed. Cannot delete estimation.", 403)

    await prisma.invoice.delete({ where: { id: estimationId }, })

    res.json({ message: "Estimation deleted successfully", })
}))

router.patch("/:id", asyncHandler(async (req: Request, res: Response) => {
    const estimationId = req.params.id;

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('open academic year first', 401)

    const parsed = UpdateEstimationDTO.safeParse(req.body);
    if (!parsed.success) throw new AppError("Invalid request data", 400);

    const { items, notes, documentNo: userDocumentNo } = parsed.data;

    const round = (n: number) => Number(n.toFixed(2));

    const estimation = await prisma.invoice.findUnique({
        where: { id: estimationId },
        include: { flowGroup: true, },
    });

    if (!estimation) throw new AppError("Estimation not found", 404);

    if (estimation.kind !== DocumentKind.ESTIMATION)
        throw new AppError("Not an estimation document", 400);

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear)
            throw new AppError("No open academic year found", 404);

        /* ======================================================
           2. DOCUMENT SEQUENCE (SAME AS CREATE)
        ====================================================== */

        const seq = await tx.documentSequence.findUnique({
            where: {
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    scope: SequenceScope.SCHOOL
                },
            },
        });

        let finalNumber = Number(estimation.documentNo);

        if (userDocumentNo) {
            const userNo = Number(userDocumentNo);

            if (Number.isNaN(userNo) || userNo <= 0) throw new AppError("Invalid estimation number", 400);

            finalNumber = Math.max(seq?.lastNumber ?? 0, userNo);

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type_scope: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.ESTIMATION,
                        scope: SequenceScope.SCHOOL
                    },
                },
                update: {
                    lastNumber: finalNumber,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.ESTIMATION,
                    scope: SequenceScope.SCHOOL,
                    lastNumber: finalNumber,
                },
            });
        }

        /* ======================================================
           3. DELETE OLD ITEMS
        ====================================================== */

        await tx.item.deleteMany({
            where: { invoiceId: estimationId },
        });

        /* ======================================================
           4. RECALCULATE ITEMS
        ====================================================== */

        let totalQuantity = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const calculatedItems = items.map((item, index) => {
            if (!item.description?.trim())
                throw new AppError(
                    `Item ${index + 1}: Description required`,
                    400
                );

            if (item.quantity <= 0)
                throw new AppError(
                    `Item ${index + 1}: Quantity must be at least 1`,
                    400
                );

            const discountPercent = Math.min(
                Math.max(item.discountPercent, 0),
                99
            );

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

        if (netAmount <= 0)
            throw new AppError(
                "Total amount must be greater than zero",
                409
            );

        /* ======================================================
           5. RECREATE ITEMS
        ====================================================== */

        await tx.item.createMany({
            data: calculatedItems.map((i) => ({
                ...i,
                invoiceId: estimationId,
            })),
        });

        /* ======================================================
           6. UPDATE ESTIMATION
        ====================================================== */

        const updated = await tx.invoice.update({
            where: { id: estimationId },
            data: {
                documentNo: String(finalNumber),
                totalQuantity,
                grossAmount: round(grossAmount),
                totalDiscount: round(totalDiscount),
                netAmount,
                notes,
            },
        });

        return updated;
    });

    res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });
})
);

export default router