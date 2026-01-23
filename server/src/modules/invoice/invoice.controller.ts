import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { DocumentType, StockEventType } from "../../generated/prisma/enums";
import { CreateInvoiceDTO } from "./invoice.schema";

// export async function createProvisionalInvoice(req: Request, res: Response) {

//     try {

//         const { customerId, billedByUserId, notes, items } = CreateInvoiceDTO.parse(req.body)


//         if (!items || items.length === 0) {
//             return res.status(400).json({ message: "No items" });
//         }

//         const result = await prisma.$transaction(async (tx) => {

//             /* --------------------------------------------------
//                1. OPEN ACADEMIC YEAR
//             -------------------------------------------------- */

//             const academicYear = await tx.academicYear.findFirst({
//                 where: { status: "OPEN" },
//             });

//             if (!academicYear) {
//                 throw new Error("No open academic year");
//             }

//             /* --------------------------------------------------
//                2. FLOW GROUP
//             -------------------------------------------------- */

//             let flowGroup = await tx.flowGroup.findFirst({
//                 where: {
//                     customerId,
//                     academicYearId: academicYear.id,
//                     status: "OPEN",
//                 },
//             });

//             if (!flowGroup) {
//                 flowGroup = await tx.flowGroup.create({
//                     data: {
//                         customerId,
//                         academicYearId: academicYear.id,
//                         status: "OPEN",
//                     },
//                 });
//             }

//             /* --------------------------------------------------
//                3. DOCUMENT NUMBER
//             -------------------------------------------------- */

//             const seq = await tx.documentSequence.upsert({
//                 where: {
//                     academicYearId_type: {
//                         academicYearId: academicYear.id,
//                         type: "PROVISIONAL_INVOICE",
//                     },
//                 },
//                 update: {
//                     lastNumber: { increment: 1 },
//                 },
//                 create: {
//                     academicYearId: academicYear.id,
//                     type: "PROVISIONAL_INVOICE",
//                     lastNumber: 1,
//                 },
//             });

//             const invoiceNo = `INV-${seq.lastNumber}`;

//             /* --------------------------------------------------
//                4. STOCK VALIDATION
//             -------------------------------------------------- */

//             for (const item of items) {
//                 const stock = await tx.stockLedger.aggregate({
//                     where: {
//                         textbookId: item.textbookId,
//                         academicYearId: academicYear.id,
//                     },
//                     _sum: { qtyChange: true },
//                 });

//                 const textbookName = await tx.textbook.findUnique({
//                     where: {
//                         id: item.textbookId
//                     },
//                     select: {
//                         title: true
//                     }
//                 })

//                 const available = stock._sum.qtyChange ?? 0;

//                 if (item.quantity > available) {
//                     throw new Error(
//                         `Insufficient stock for ${textbookName?.title}. Available ${available}`
//                     );
//                 }
//             }

//             /* --------------------------------------------------
//                5. CALCULATIONS
//             -------------------------------------------------- */

//             let totalQty = 0;
//             let gross = 0;
//             let discount = 0;
//             let net = 0;

//             for (const item of items) {
//                 const g = item.quantity * item.unitPrice;

//                 let d = 0;

//                 if (item.discountType === "PERCENT") {
//                     d = (g * item.discountValue) / 100;
//                 } else {
//                     d = item.discountValue;
//                 }

//                 totalQty += item.quantity;
//                 gross += g;
//                 discount += d;
//                 net += g - d;
//             }

//             /* --------------------------------------------------
//                6. CREATE INVOICE
//             -------------------------------------------------- */

//             const invoice = await tx.provisionalInvoice.create({
//                 data: {
//                     invoiceNo,
//                     date: new Date(),
//                     flowGroupId: flowGroup.id,
//                     totalQuantity: totalQty,
//                     grossAmount: gross,
//                     totalDiscount: discount,
//                     netAmount: net,
//                     notes,
//                     billedByUserId,
//                 },
//             });

//             /* --------------------------------------------------
//                7. ITEMS + STOCK LEDGER
//             -------------------------------------------------- */

//             for (const item of items) {
//                 const g = item.quantity * item.unitPrice;

//                 let d = 0;
//                 if (item.discountType === "PERCENT") {
//                     d = (g * item.discountValue) / 100;
//                 } else {
//                     d = item.discountValue;
//                 }

//                 const n = g - d;

//                 await tx.provisionalInvoiceItem.create({
//                     data: {
//                         invoiceId: invoice.id,
//                         textbookId: item.textbookId,
//                         quantity: item.quantity,
//                         unitPrice: item.unitPrice,
//                         discountType: item.discountType,
//                         discountValue: item.discountValue,
//                         grossAmount: g,
//                         netAmount: n,
//                     },
//                 });

//                 await tx.stockLedger.create({
//                     data: {
//                         academicYearId: academicYear.id,
//                         textbookId: item.textbookId,
//                         qtyChange: -item.quantity,
//                         eventType: "ISSUE",
//                         referenceId: invoice.id,
//                     },
//                 });
//             }

//             return invoice;
//         });

//         res.json({
//             success: true,
//             invoiceId: result.id,
//         });
//     } catch (e: any) {
//         res.status(400).json({ message: e.message });
//     }
// }

export async function createProvisionalInvoice(req: Request, res: Response) {
    try {
        const data = CreateInvoiceDTO.parse(req.body);

        if (!data) return res.status(400).json({ message: "Validation failed" })

        const { customerId, billedByUserId, notes, items } = data

        if (!items.length) {
            return res.status(400).json({ message: "No items" });
        }

        const result = await prisma.$transaction(async (tx) => {

            /* ======================================================
               1. OPEN ACADEMIC YEAR
            ====================================================== */

            const academicYear = await tx.academicYear.findFirst({
                where: { status: "OPEN" },
            });

            if (!academicYear) {
                throw new Error("No open academic year");
            }

            /* ======================================================
               2. FLOW GROUP
            ====================================================== */

            let flowGroup = await tx.flowGroup.findFirst({
                where: {
                    customerId,
                    academicYearId: academicYear.id,
                    status: "OPEN",
                },
            });

            if (!flowGroup) {
                flowGroup = await tx.flowGroup.create({
                    data: {
                        customerId,
                        academicYearId: academicYear.id,
                        status: "OPEN",
                    },
                });
            }

            /* ======================================================
               3. DOCUMENT SEQUENCE
            ====================================================== */

            const seq = await tx.documentSequence.upsert({
                where: {
                    academicYearId_type: {
                        academicYearId: academicYear.id,
                        type: "PROVISIONAL_INVOICE",
                    },
                },
                update: {
                    lastNumber: { increment: 1 },
                },
                create: {
                    academicYearId: academicYear.id,
                    type: "PROVISIONAL_INVOICE",
                    lastNumber: 1,
                },
            });

            const invoiceNo = `INV-${seq.lastNumber}`;

            /* ======================================================
               4. BATCH STOCK VALIDATION
            ====================================================== */

            const textbookIds = items.map(i => i.textbookId);

            // total stock per book
            const stockRows = await tx.stockLedger.groupBy({
                by: ["textbookId"],
                where: {
                    academicYearId: academicYear.id,
                    textbookId: { in: textbookIds },
                },
                _sum: {
                    qtyChange: true,
                },
            });

            const stockMap = new Map(
                stockRows.map(s => [
                    s.textbookId,
                    s._sum.qtyChange ?? 0,
                ])
            );

            const textbooks = await tx.textbook.findMany({
                where: { id: { in: textbookIds } },
                select: { id: true, title: true },
            });

            const titleMap = new Map(
                textbooks.map(t => [t.id, t.title])
            );

            for (const item of items) {
                const available = stockMap.get(item.textbookId) ?? 0;
                const title = titleMap.get(item.textbookId) ?? "Item";

                if (item.quantity > available) {
                    throw new Error(
                        `Insufficient stock for ${title}. Available ${available}`
                    );
                }
            }

            /* ======================================================
               5. CALCULATIONS
            ====================================================== */

            let totalQty = 0;
            let grossAmount = 0;
            let totalDiscount = 0;

            const calculate = (item: any) => {
                const gross = item.quantity * item.unitPrice;

                const discount =
                    item.discountType === "PERCENT"
                        ? (gross * item.discountValue) / 100
                        : item.discountValue;

                return {
                    gross,
                    discount,
                    net: gross - discount,
                };
            };

            for (const item of items) {
                const { gross, discount } = calculate(item);
                totalQty += item.quantity;
                grossAmount += gross;
                totalDiscount += discount;
            }

            const netAmount = grossAmount - totalDiscount;

            /* ======================================================
               6. CREATE INVOICE
            ====================================================== */

            const invoice = await tx.provisionalInvoice.create({
                data: {
                    invoiceNo,
                    date: new Date(),
                    flowGroupId: flowGroup.id,
                    totalQuantity: totalQty,
                    grossAmount,
                    totalDiscount,
                    netAmount,
                    notes,
                    billedByUserId,
                },
            });

            /* ======================================================
               7. CREATE ITEMS + STOCK LEDGER (BATCH)
            ====================================================== */

            const invoiceItems = [];
            const stockEntries = [];

            for (const item of items) {
                const { gross, discount, net } = calculate(item);

                invoiceItems.push({
                    invoiceId: invoice.id,
                    textbookId: item.textbookId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discountType: item.discountType,
                    discountValue: item.discountValue,
                    grossAmount: gross,
                    netAmount: net,
                });

                stockEntries.push({
                    academicYearId: academicYear.id,
                    textbookId: item.textbookId,
                    qtyChange: -item.quantity,
                    eventType: StockEventType.ISSUE,
                    referenceId: invoice.id,
                });
            }

            await tx.provisionalInvoiceItem.createMany({
                data: invoiceItems,
            });

            await tx.stockLedger.createMany({
                data: stockEntries,
            });

            return invoice;
        });

        return res.json({
            success: true,
            invoiceId: result.id,
        });

    } catch (e: any) {
        console.log(e)
        return res.status(400).json({
            message: e.message || "Failed to create invoice",
        });
    }
}

export async function getInvoice(req: Request, res: Response) {
    const invoiceId = req.params.id;

    const invoice = await prisma.provisionalInvoice.findUnique({
        where: { id: invoiceId },
        include: {
            items: {
                include: {
                    textbook: {
                        include: {
                            dealer: true,
                        },
                    },
                },
            },
            flowGroup: {
                include: {
                    customer: true,
                },
            },
            billedByUser: {
                select: {
                    name: true
                }
            }
        },
    });

    if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });

    const company = await prisma.companyInfo.findFirst();

    const rows = invoice.items.map((i) => {
        const gross = Number(i.unitPrice) * i.quantity;
        const discount =
            i.discountType === "PERCENT"
                ? (gross * Number(i.discountValue)) / 100
                : Number(i.discountValue);

        return {
            title: i.textbook.title,
            qty: i.quantity,
            rate: Number(i.unitPrice),
            discountPercent:
                i.discountType === "PERCENT"
                    ? Number(i.discountValue)
                    : 0,
            gross,
            discount,
            net: gross - discount,
        };
    });

    const totals = {
        qty: rows.reduce((s, r) => s + r.qty, 0),
        gross: rows.reduce((s, r) => s + r.gross, 0),
        discount: rows.reduce((s, r) => s + r.discount, 0),
    };

    res.json({
        invoiceNo: invoice.invoiceNo,
        date: invoice.date,

        company: {
            name: company?.name,
            phone: company?.phone,
            email: company?.email,
            gst: company?.gst,
            address: `${company?.town}, ${company?.district}, ${company?.state} - ${company?.pincode}`,
            bankName: company?.bankName,
            accountNo: company?.accountNo,
            ifsc: company?.ifsc,
            upi: company?.upi,
            logoUrl: company?.logoUrl,
            qrCodeUrl: company?.qrCodeUrl
        },

        customer: {
            name: invoice.flowGroup.customer?.name,
            address: `${invoice.flowGroup.customer?.town}, ${invoice.flowGroup.customer?.district}`,
            phone: invoice.flowGroup.customer?.phone,
            gst: invoice.flowGroup.customer?.gst,
        },

        items: rows,

        totals: {
            ...totals,
            final: totals.gross - totals.discount,
        },

        billedBy: invoice.billedByUser?.name,
    });
};

export async function getNextInvoiceNumber(_req: Request, res: Response) {
    try {
        const academicYear = await prisma.academicYear.findFirst({
            where: { status: "OPEN" },
            select: { id: true },
        });

        if (!academicYear) {
            return res.status(400).json({
                message: "No open academic year",
            });
        }

        const sequence = await prisma.documentSequence.findUnique({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentType.PROVISIONAL_INVOICE,
                },
            },
            select: {
                lastNumber: true,
            },
        });

        const nextNumber = (sequence?.lastNumber ?? 0) + 1;

        const invoiceNo = `INV-${nextNumber.toString()}`;

        return res.json({
            invoiceNo,
            nextNumber,
        });

    } catch (error) {
        console.error("Invoice preview error:", error);
        return res.status(500).json({
            message: "Failed to get invoice number",
        });
    }
}