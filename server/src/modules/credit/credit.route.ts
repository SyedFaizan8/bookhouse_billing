import { Router } from "express";
import { Response, Request } from "express";
import { prisma } from "../../prisma.js";
import { DocumentKind, FlowStatus } from "../../generated/prisma/enums.js";
import { CreateCompanyCreditNoteDTO, CreateCreditNoteDTO } from "./credit.schema.js";
import { AppError } from "../../utils/error.js";
import { asyncHandler } from "../../utils/async.js";

const router = Router()

router.post("/school/new", asyncHandler(async (req: Request, res: Response) => {
    const parsed = CreateCreditNoteDTO.safeParse(req.body);

    if (parsed.error) throw new AppError('Invalid request data', 400)

    const { items, billedByUserId, schoolId, notes } = parsed.data

    if (!items.length) throw new AppError('At least one item is required', 400)

    const round = (n: number) => Number(n.toFixed(2));

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError("No open academic year found", 401);


        /* ======================================================
           2. FLOW GROUP (CUSTOMER LEDGER GROUP)
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
           3. DOCUMENT NUMBER (CREDIT NOTE)
        ====================================================== */

        const seq = await tx.documentSequence.upsert({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.CREDIT_NOTE,
                },
            },
            update: {
                lastNumber: { increment: 1 },
            },
            create: {
                academicYearId: academicYear.id,
                type: DocumentKind.CREDIT_NOTE,
                lastNumber: 1,
            },
        });

        const documentNo = String(seq.lastNumber);

        /* ======================================================
           4. CALCULATIONS (SERVER = SOURCE OF TRUTH)
        ====================================================== */

        let totalQuantity = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const calculatedItems = items.map((item, index) => {
            if (!item.description?.trim()) throw new AppError(`Item ${index + 1}: Description is required`, 401);


            if (item.quantity <= 0) throw new AppError(`Item ${index + 1}: Quantity must be at least 1`, 401);


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
           5. CREATE CREDIT NOTE DOCUMENT
        ====================================================== */

        const creditNote = await tx.invoice.create({
            data: {
                documentNo,
                date: new Date(),
                kind: DocumentKind.CREDIT_NOTE,

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
                invoiceId: creditNote.id,
            })),
        });

        return creditNote;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))

router.post("/company/new", asyncHandler(async (req: Request, res: Response) => {
    const parsed = CreateCompanyCreditNoteDTO.safeParse(req.body);

    if (!parsed.success) throw new AppError('Invalid request data', 400)

    const { companyId, billedByUserId, notes, items } = parsed.data;

    if (!items.length) throw new AppError('At least one item is required', 400)

    const round = (n: number) => Number(n.toFixed(2));

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError('No open academic year found', 409)

        /* ======================================================
           2. FLOW GROUP (CUSTOMER LEDGER GROUP)
        ====================================================== */

        let flowGroup = await tx.flowGroup.findFirst({
            where: {
                companyId,
                academicYearId: academicYear.id,
                status: FlowStatus.OPEN,
            },
        });

        if (!flowGroup) {
            flowGroup = await tx.flowGroup.create({
                data: {
                    companyId,
                    academicYearId: academicYear.id,
                    status: FlowStatus.OPEN,
                },
            });
        }

        /* ======================================================
           3. DOCUMENT NUMBER (CREDIT NOTE)
        ====================================================== */

        const seq = await tx.documentSequence.upsert({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.CREDIT_NOTE,
                },
            },
            update: {
                lastNumber: { increment: 1 },
            },
            create: {
                academicYearId: academicYear.id,
                type: DocumentKind.CREDIT_NOTE,
                lastNumber: 1,
            },
        });

        const documentNo = String(seq.lastNumber);

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
           5. CREATE CREDIT NOTE DOCUMENT
        ====================================================== */

        const creditNote = await tx.invoice.create({
            data: {
                documentNo,
                date: new Date(),
                kind: DocumentKind.CREDIT_NOTE,

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
                invoiceId: creditNote.id,
            })),
        });

        return creditNote;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))


router.get("/school/:id", asyncHandler(async (req: Request, res: Response) => {

    const schoolId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('create academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const creditNote = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                schoolId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.CREDIT_NOTE
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
            status: true
        },
    });

    if (!creditNote) throw new AppError('No Credit Note found', 401)

    return res.json(
        creditNote.map((crt) => ({
            id: crt.id,
            documentNo: crt.documentNo,
            date: crt.date,
            totalQty: crt.totalQuantity,
            amount: crt.netAmount.toNumber(),
            status: crt.status,
            createdAt: crt.createdAt,
        }))
    );
}))

router.get("/company/:id", asyncHandler(async (req: Request, res: Response) => {

    const companyId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('create academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const creditNote = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                companyId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.CREDIT_NOTE
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
            status: true,
            createdAt: true,
        },
    });

    if (!creditNote) throw new AppError('No Credit Note found', 401)

    return res.json(
        creditNote.map((crt) => ({
            id: crt.id,
            documentNo: crt.documentNo,
            date: crt.date,
            totalQty: crt.totalQuantity,
            amount: crt.netAmount.toNumber(),
            status: crt.status,
            createdAt: crt.createdAt,
        }))
    );
}))

export default router