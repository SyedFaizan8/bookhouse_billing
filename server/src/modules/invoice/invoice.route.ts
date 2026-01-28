import { Router } from "express";
import { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { DocumentKind, FlowStatus } from "../../generated/prisma/enums.js";
import { CreateCompanyInvoiceDTO, CreateInvoiceDTO } from "./invoice.schema.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";

const router = Router()

// CREATE SCHOOL INVOICE
router.post("/school/new", asyncHandler(async (req: Request, res: Response) => {
    const parsed = CreateInvoiceDTO.safeParse(req.body);

    if (!parsed.success) throw new AppError('Invalid request data', 400)

    const { schoolId, billedByUserId, notes, items } = parsed.data;

    if (!items.length) throw new AppError('At least one item is required')

    const round = (n: number) => Number(n.toFixed(2));


    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError('No open academic year found', 404)

        /* ======================================================
           2. FLOW GROUP (CUSTOMER ACCOUNT)
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
           3. DOCUMENT NUMBER (INVOICE)
        ====================================================== */

        const seq = await tx.documentSequence.upsert({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.INVOICE,
                },
            },
            update: {
                lastNumber: { increment: 1 },
            },
            create: {
                academicYearId: academicYear.id,
                type: DocumentKind.INVOICE,
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

            if (!item.description?.trim()) throw new AppError(`Item ${index + 1}: Description is required`, 400);

            if (item.quantity <= 0) throw new AppError(`Item ${index + 1}: Quantity must be at least 1`, 400);

            if (item.unitPrice < 0) throw new AppError(`Item ${index + 1}: Invalid rate`, 400);

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

        if (netAmount <= 0) throw new AppError("Invoice total must be greater than zero", 409);

        /* ======================================================
           5. CREATE INVOICE DOCUMENT
        ====================================================== */

        const invoice = await tx.invoice.create({
            data: {
                documentNo,
                date: new Date(),
                kind: DocumentKind.INVOICE,

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
                invoiceId: invoice.id,
            })),
        });

        return invoice;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))


// CREATE COMPANY INVOICE
router.post("/company/new", asyncHandler(async (req: Request, res: Response) => {
    const parsed = CreateCompanyInvoiceDTO.safeParse(req.body);

    if (!parsed.success) throw new AppError('Invalid request data', 400)

    const { companyId, supplierInvoiceNo, invoiceDate, recordedByUserId, notes, items } = parsed.data;

    if (!items.length) throw new AppError('At least one item is required', 400)

    const round = (n: number) => Number(n.toFixed(2));

    const result = await prisma.$transaction(async (tx) => {

        /* ======================================================
           1. OPEN ACADEMIC YEAR
        ====================================================== */

        const academicYear = await tx.academicYear.findFirst({
            where: { status: FlowStatus.OPEN },
        });

        if (!academicYear) throw new AppError("No open academic year found", 404);

        /* ======================================================
           2. FLOW GROUP (CUSTOMER ACCOUNT)
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
           3. CALCULATIONS (SERVER = SOURCE OF TRUTH)
        ====================================================== */

        let totalQuantity = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const calculatedItems = items.map((item, index) => {

            if (!item.description?.trim()) throw new AppError(`Item ${index + 1}: Description is required`, 400);

            if (item.quantity <= 0) throw new AppError(`Item ${index + 1}: Quantity must be at least 1`, 400);

            if (item.unitPrice < 0) throw new AppError(`Item ${index + 1}: Invalid rate`, 400);

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

        if (netAmount <= 0) throw new AppError("Invoice total must be greater than zero", 409);

        /* ======================================================
           4. CREATE INVOICE DOCUMENT
        ====================================================== */

        const invoice = await tx.invoice.create({
            data: {
                documentNo: supplierInvoiceNo,
                date: new Date(invoiceDate),
                kind: DocumentKind.INVOICE,

                flowGroupId: flowGroup.id,

                totalQuantity,
                grossAmount: round(grossAmount),
                totalDiscount: round(totalDiscount),
                netAmount,

                notes,
                billedByUserId: recordedByUserId,
            },
        });

        /* ======================================================
           5. CREATE ITEMS
        ====================================================== */

        await tx.item.createMany({
            data: calculatedItems.map((i) => ({
                ...i,
                invoiceId: invoice.id,
            })),
        });

        return invoice;
    });

    return res.json({
        success: true,
        documentId: result.id,
        documentNo: result.documentNo,
    });

}))


// router.get("/next-number", getNextInvoiceNumber);

// GET SCHOOL INVOICES
router.get("/school/:id", asyncHandler(async (req: Request, res: Response) => {

    const schoolId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('create academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const invoices = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                schoolId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.INVOICE
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

    if (!invoices) throw new AppError('No Invoices found', 401)

    return res.json(
        invoices.map((inv) => ({
            id: inv.id,
            documentNo: inv.documentNo,
            date: inv.date,
            totalQty: inv.totalQuantity,
            amount: inv.netAmount.toNumber(),
            createdAt: inv.createdAt,
        }))
    );
}))

// GET COMPANY INVOICES
router.get("/company/:id", asyncHandler(async (req: Request, res: Response) => {

    const companyId = req.params.id;

    // 🔹 get open academic year
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('create academic year first', 401)

    // 🔹 get invoices directly using relation filter
    const invoices = await prisma.invoice.findMany({
        where: {
            flowGroup: {
                companyId,
                academicYearId: academicYear.id,
            },
            kind: DocumentKind.INVOICE
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

    if (!invoices) throw new AppError('No Invoices found', 401)

    return res.json(
        invoices.map((inv) => ({
            id: inv.id,
            documentNo: inv.documentNo,
            date: inv.date,
            totalQty: inv.totalQuantity,
            amount: inv.netAmount.toNumber(),
            createdAt: inv.createdAt,
        }))
    );
}))

// GET INDIVIDUAL SCHOOL INVOICE
router.get("/school/single/:id", asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id;

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            items: {
                select: {
                    unitPrice: true,
                    quantity: true,
                    discountPercent: true,
                    description: true,
                    class: true,
                    company: true,
                }
            },
            flowGroup: {
                include: {
                    school: true,
                },
            },
            billedByUser: {
                select: {
                    name: true
                }
            }
        },
    });

    if (!invoice) throw new AppError('Invoice not found', 401)

    const rows = invoice.items.map((i) => {
        const grossAmount = Number(i.unitPrice) * i.quantity;
        const discountAmount =
            (grossAmount * Number(i.discountPercent)) / 100;

        return {
            description: i.description,
            class: i.class,
            company: i.company,

            quantity: i.quantity,
            rate: Number(i.unitPrice),

            discountPercent: Number(i.discountPercent),
            discountAmount,

            grossAmount,
            netAmount: grossAmount - discountAmount,
        };
    });

    const totals = {
        totalQuantity: rows.reduce((s, i) => s + i.quantity, 0),
        grossAmount: rows.reduce((s, i) => s + i.grossAmount, 0),
        totalDiscount: rows.reduce((s, i) => s + i.discountAmount, 0),
        netAmount: rows.reduce((s, i) => s + i.netAmount, 0),
    };

    res.json({
        documentNo: invoice.documentNo,
        date: invoice.date,

        school: {
            name: invoice.flowGroup.school?.name,
            phone: invoice.flowGroup.school?.phone,
            email: invoice.flowGroup.school?.email,
            contactPerson: invoice.flowGroup.school?.contactPerson,

            street: invoice.flowGroup.school?.street,
            town: invoice.flowGroup.school?.town,
            district: invoice.flowGroup.school?.district,
            state: invoice.flowGroup.school?.state,
            pincode: invoice.flowGroup.school?.pincode,

            gst: invoice.flowGroup.school?.gst
        },

        items: rows,

        totals,

        billedBy: invoice.billedByUser?.name,
        kind: invoice.kind
    }
    )
}))

// GET INDIVIDUAL COMPANY INVOICE
router.get("/company/single/:id", asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id;

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            items: {
                select: {
                    unitPrice: true,
                    quantity: true,
                    discountPercent: true,
                    description: true,
                    class: true,
                    company: true,
                }
            },
            flowGroup: {
                include: {
                    company: true,
                },
            },
            billedByUser: {
                select: {
                    name: true
                }
            }
        },
    });

    if (!invoice) throw new AppError('Invoice not found', 404)


    const rows = invoice.items.map((i) => {
        const grossAmount = Number(i.unitPrice) * i.quantity;
        const discountAmount =
            (grossAmount * Number(i.discountPercent)) / 100;

        return {
            description: i.description,
            class: i.class,
            company: i.company,

            quantity: i.quantity,
            rate: Number(i.unitPrice),

            discountPercent: Number(i.discountPercent),
            discountAmount,

            grossAmount,
            netAmount: grossAmount - discountAmount,
        };
    });

    const totals = {
        totalQuantity: rows.reduce((s, i) => s + i.quantity, 0),
        grossAmount: rows.reduce((s, i) => s + i.grossAmount, 0),
        totalDiscount: rows.reduce((s, i) => s + i.discountAmount, 0),
        netAmount: rows.reduce((s, i) => s + i.netAmount, 0),
    };

    res.json({
        documentNo: invoice.documentNo,
        date: invoice.date,

        company: {
            name: invoice.flowGroup.company?.name,
            phone: invoice.flowGroup.company?.phone,
            email: invoice.flowGroup.company?.email,

            street: invoice.flowGroup.company?.street,
            town: invoice.flowGroup.company?.town,
            district: invoice.flowGroup.company?.district,
            state: invoice.flowGroup.company?.state,
            pincode: invoice.flowGroup.company?.pincode,

            gst: invoice.flowGroup.company?.gst
        },

        items: rows,

        totals,

        billedBy: invoice.billedByUser?.name,
        kind: invoice.kind
    })

}))


export default router
