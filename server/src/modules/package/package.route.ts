import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { AcademicYearStatus, DocumentKind, FlowStatus, SequenceScope } from "../../generated/prisma/enums.js";
import { AppError } from "../../utils/error.js";
import { asyncHandler } from "../../utils/async.js";
import { CreateEstimationDTO, UpdateEstimationDTO } from "../estimation/estimation.schema.js";

const router = Router();

router.patch("/:id/pending", asyncHandler(async (req: Request, res: Response) => {
    const { items } = req.body;


    const academicYear = await prisma.academicYear.findFirst({
        where: { status: FlowStatus.OPEN },
    });

    if (!academicYear) throw new AppError("No open academic year found", 404);


    await prisma.$transaction(
        items.map((i: any) =>
            prisma.item.update({
                where: { id: i.id },
                data: { pending: i.pending },
            })
        )
    );

    res.json({ success: true });
}));

// GET ALL PACKAGES
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {

    const schoolId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('open academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const packageNote = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                schoolId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.PACKAGE_NOTE
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
            items: {
                select: {
                    pending: true
                }
            }
        },
    });

    if (!packageNote) throw new AppError('No Packages found', 401)

    return res.json(
        packageNote.map((pkg) => {
            const totalPending = pkg.items.reduce((sum, i) => sum + (i.pending || 0), 0);

            return {
                id: pkg.id,
                documentNo: pkg.documentNo,
                date: pkg.date,
                totalQty: pkg.totalQuantity,
                amount: pkg.netAmount.toNumber(),
                pending: totalPending,
                createdAt: pkg.createdAt,
            };
        })
    );
}))

// CREATE PACKAGE
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
                    type: DocumentKind.PACKAGE_NOTE,
                    scope: SequenceScope.SCHOOL,
                },
            },
        });

        const lastNumber = seq?.lastNumber ?? 0;
        const userNo = Number(userDocumentNo);

        if (!userNo || userNo <= 0) throw new AppError("Invalid Package number", 409);

        /* ✅ 1. check duplicate */
        const exists = await tx.invoice.findFirst({
            where: {
                flowGroup: {
                    schoolId,
                    academicYearId: academicYear.id,
                },
                kind: DocumentKind.PACKAGE_NOTE,
                documentNo: String(userNo)
            }
        });

        if (exists) throw new AppError(`Package #${userNo} already exists`, 409);

        /* ✅ 2. enforce forward only */
        if (userNo <= lastNumber) throw new AppError(`Number must be greater than ${lastNumber}`, 409);

        /* ✅ 3. update sequence */
        await tx.documentSequence.upsert({
            where: {
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PACKAGE_NOTE,
                    scope: SequenceScope.SCHOOL,
                },
            },
            update: {
                lastNumber: userNo,
            },
            create: {
                academicYearId: academicYear.id,
                type: DocumentKind.PACKAGE_NOTE,
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
           5. CREATE PACKAGE DOCUMENT
        ====================================================== */

        const packageNote = await tx.invoice.create({
            data: {
                documentNo: String(userNo),
                date: new Date(),
                kind: DocumentKind.PACKAGE_NOTE,

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
                invoiceId: packageNote.id,
            })),
        });

        return packageNote;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))

router.post('/delete/:id', asyncHandler(async (req: Request, res: Response) => {
    const packageId = req.params.id

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('open academic year first', 401)

    const packageNote = await prisma.invoice.findFirst({
        where: {
            id: packageId,
            kind: DocumentKind.PACKAGE_NOTE,
        },
        include: {
            flowGroup: {
                include: {
                    academicYear: true,
                },
            },
        },
    })

    if (!packageNote) throw new AppError("Package Note not found", 404)

    // 🔒 Academic year lock
    if (packageNote.flowGroup.academicYear.status !== AcademicYearStatus.OPEN)
        throw new AppError("Academic year is closed. Cannot delete Package Note.", 403)

    // 🔒 Flow group lock
    if (packageNote.flowGroup.status !== FlowStatus.OPEN)
        throw new AppError("Flow group is closed. Cannot delete Package Note.", 403)

    await prisma.invoice.delete({ where: { id: packageId }, })

    res.json({ message: "Package Note deleted successfully", })
}))

router.patch("/:id", asyncHandler(async (req: Request, res: Response) => {
    const packageId = req.params.id;

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('open academic year first', 401)

    const parsed = UpdateEstimationDTO.safeParse(req.body);
    if (!parsed.success) throw new AppError("Invalid request data", 400);

    const { items, notes, documentNo: userDocumentNo } = parsed.data;

    const round = (n: number) => Number(n.toFixed(2));

    const packageNote = await prisma.invoice.findUnique({
        where: { id: packageId },
        include: { flowGroup: true, },
    });

    if (!packageNote) throw new AppError("Package not found", 404);

    if (packageNote.kind !== DocumentKind.PACKAGE_NOTE) throw new AppError("Not an package note document", 400);

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError("No open academic year found", 404);

        /* ======================================================
           2. DOCUMENT SEQUENCE (SAME AS CREATE)
        ====================================================== */

        const seq = await tx.documentSequence.findUnique({
            where: {
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PACKAGE_NOTE,
                    scope: SequenceScope.SCHOOL
                },
            },
        });

        let finalNumber = Number(packageNote.documentNo);

        if (userDocumentNo) {
            const userNo = Number(userDocumentNo);

            if (Number.isNaN(userNo) || userNo <= 0) throw new AppError("Invalid package note number", 400);

            finalNumber = Math.max(seq?.lastNumber ?? 0, userNo);

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type_scope: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.PACKAGE_NOTE,
                        scope: SequenceScope.SCHOOL
                    },
                },
                update: {
                    lastNumber: finalNumber,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PACKAGE_NOTE,
                    scope: SequenceScope.SCHOOL,
                    lastNumber: finalNumber,
                },
            });
        }

        /* ======================================================
           3. DELETE OLD ITEMS
        ====================================================== */

        await tx.item.deleteMany({
            where: { invoiceId: packageId },
        });

        /* ======================================================
           4. RECALCULATE ITEMS
        ====================================================== */

        let totalQuantity = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const calculatedItems = items.map((item, index) => {
            if (!item.description?.trim())
                throw new AppError(`Item ${index + 1}: Description required`, 400);

            if (item.quantity <= 0)
                throw new AppError(`Item ${index + 1}: Quantity must be at least 1`, 400);

            const discountPercent = Math.min(Math.max(item.discountPercent, 0), 99);

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
                pending: item.pending ?? 0
            };
        });

        const netAmount = round(grossAmount - totalDiscount);

        if (netAmount <= 0) throw new AppError("Total amount must be greater than zero", 409);

        /* ======================================================
           5. RECREATE ITEMS
        ====================================================== */

        await tx.item.createMany({
            data: calculatedItems.map((i) => ({
                ...i,
                invoiceId: packageId,
            })),
        });

        /* ======================================================
           6. UPDATE PACKAGE
        ====================================================== */

        const updated = await tx.invoice.update({
            where: { id: packageId },
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

export default router;
