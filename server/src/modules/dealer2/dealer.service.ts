import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { StockEventType } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js"
import { DealerPaymentInput, DealerReturnInput, DealerSupplyInput } from "./dealer.schema.js";

export async function getDealerProfile(dealerId: string) {

    const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            street: true,
            town: true,
            district: true,
            state: true,
            pincode: true,
            gst: true,
            bankName: true,
            accountNo: true,
            ifsc: true,
            active: true,
            createdAt: true,
        },
    })

    if (!dealer) throw new Error("Dealer not found")

    return dealer

}

interface SupplyParams extends DealerSupplyInput {
    dealerId: string;
}

export async function createDealerSupply({
    dealerId,
    dealerInvoiceNo,
    invoiceDate,
    notes,
    items,
    recordedByUserId
}: SupplyParams) {

    return prisma.$transaction(async (tx) => {
        /* -----------------------------
           1. Find OPEN academic year
        ------------------------------ */
        const academicYear = await tx.academicYear.findFirst({
            where: { status: "OPEN" },
        });

        if (!academicYear) {
            throw new Error("No open academic year");
        }

        /* -----------------------------
           2. Create FlowGroup (Dealer)
        ------------------------------ */

        let flowGroup = await tx.flowGroup.findFirst({
            where: {
                dealerId,
                academicYearId: academicYear.id,
                status: "OPEN",
            },
        });

        if (!flowGroup) {
            flowGroup = await tx.flowGroup.create({
                data: {
                    dealerId,
                    academicYearId: academicYear.id,
                    description: "Dealer settlement",
                },
            });
        }

        /* -----------------------------
           3. Create Provisional Invoice
        ------------------------------ */
        const invoice = await tx.provisionalInvoice.create({
            data: {
                invoiceNo: dealerInvoiceNo,
                date: new Date(invoiceDate),
                flowGroupId: flowGroup.id,
                totalQuantity: 0,
                grossAmount: 0,
                totalDiscount: 0,
                netAmount: 0,
                notes,
                billedByUserId: recordedByUserId
            },
        });

        let totalQty = 0;
        let totalAmount = 0;

        /* -----------------------------
           4. Process Items
        ------------------------------ */
        for (const item of items) {
            let textbookId = item.textbookId;

            // 🔹 Auto-create textbook if missing
            if (!textbookId) {
                const book = await tx.textbook.create({
                    data: {
                        title: item.title,
                        class: item.class,
                        mrp: item.mrp,
                        sellingPrice: item.mrp, // default
                        dealerId,
                    },
                });
                textbookId = book.id;
            }

            const lineAmount = item.qty * item.mrp;

            // Invoice item
            await tx.provisionalInvoiceItem.create({
                data: {
                    invoiceId: invoice.id,
                    textbookId,
                    quantity: item.qty,
                    unitPrice: item.mrp,
                    discountType: "AMOUNT",
                    discountValue: 0,
                    grossAmount: lineAmount,
                    netAmount: lineAmount,
                },
            });

            // Stock ledger (+)
            await tx.stockLedger.create({
                data: {
                    academicYearId: academicYear.id,
                    textbookId,
                    qtyChange: item.qty,
                    eventType: StockEventType.PURCHASE,
                    referenceId: invoice.id,
                },
            });

            totalQty += item.qty;
            totalAmount += lineAmount;
        }

        /* -----------------------------
           5. Update Invoice Totals
        ------------------------------ */
        await tx.provisionalInvoice.update({
            where: { id: invoice.id },
            data: {
                totalQuantity: totalQty,
                grossAmount: totalAmount,
                netAmount: totalAmount,
            },
        });

        return {
            flowGroupId: flowGroup.id,
            invoiceId: invoice.id,
            totalQty,
            totalAmount,
        };
    });
}

interface ReturnParams extends DealerReturnInput {
    dealerId: string;
}

export async function createDealerReturn({
    dealerId,
    date,
    items,
}: ReturnParams) {
    return prisma.$transaction(async (tx) => {
        /* -----------------------------
           1. Academic year
        ------------------------------ */
        const academicYear = await tx.academicYear.findFirst({
            where: { status: "OPEN" },
        });
        if (!academicYear) throw new Error("No open academic year");

        /* -----------------------------
           2. OPEN FlowGroup
        ------------------------------ */
        const flowGroup = await tx.flowGroup.findFirst({
            where: {
                dealerId,
                academicYearId: academicYear.id,
                status: "OPEN",
            },
        });
        if (!flowGroup) {
            throw new Error("No open dealer flow");
        }

        /* -----------------------------
           3. Create Purchase Return
        ------------------------------ */
        const purchaseReturn = await tx.purchaseReturn.create({
            data: {
                flowGroupId: flowGroup.id,
                date: new Date(date),
            },
        });

        /* -----------------------------
           4. Process items safely
        ------------------------------ */
        for (const item of items) {
            /* -----------------------------
               A. TOTAL PURCHASED FROM DEALER
            ------------------------------ */
            const purchased = await tx.provisionalInvoiceItem.aggregate({
                where: {
                    invoice: {
                        flowGroupId: flowGroup.id,
                    },
                    textbookId: item.textbookId,
                },
                _sum: {
                    quantity: true,
                },
            });

            const purchasedQty = purchased._sum.quantity ?? 0;

            /* -----------------------------
               B. ALREADY RETURNED
            ------------------------------ */
            const returned = await tx.purchaseReturnItem.aggregate({
                where: {
                    purchaseReturn: {
                        flowGroupId: flowGroup.id,
                    },
                    textbookId: item.textbookId,
                },
                _sum: {
                    qtyReturned: true,
                },
            });

            const alreadyReturnedQty = returned._sum.qtyReturned ?? 0;

            const maxReturnableQty =
                purchasedQty - alreadyReturnedQty;

            if (maxReturnableQty <= 0) {
                throw new Error(
                    `Nothing left to return for textbook ${item.textbookId}`
                );
            }

            if (item.qty > maxReturnableQty) {
                throw new Error(
                    `Return qty exceeds purchased qty for textbook ${item.textbookId}.
           Max allowed: ${maxReturnableQty}`
                );
            }

            /* -----------------------------
               C. FIND ORIGINAL UNIT PRICE
            ------------------------------ */
            const lastPurchaseItem =
                await tx.provisionalInvoiceItem.findFirst({
                    where: {
                        invoice: {
                            flowGroupId: flowGroup.id,
                        },
                        textbookId: item.textbookId,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

            if (!lastPurchaseItem) {
                throw new Error("Purchase price not found");
            }

            const unitPrice = lastPurchaseItem.unitPrice;

            /* -----------------------------
               D. CREATE RETURN ITEM
            ------------------------------ */
            await tx.purchaseReturnItem.create({
                data: {
                    purchaseReturnId: purchaseReturn.id,
                    textbookId: item.textbookId,
                    qtyReturned: item.qty,
                    unitPrice, // ✅ CRITICAL
                },
            });

            /* -----------------------------
               E. STOCK LEDGER (-)
            ------------------------------ */
            await tx.stockLedger.create({
                data: {
                    academicYearId: academicYear.id,
                    textbookId: item.textbookId,
                    qtyChange: -item.qty,
                    eventType: StockEventType.DEALER_RETURN,
                    referenceId: purchaseReturn.id,
                },
            });
        }

        return {
            purchaseReturnId: purchaseReturn.id,
        };
    });
}

interface PaymentParams extends DealerPaymentInput {
    dealerId: string;
    userId: string;
}

export async function createDealerPayment({
    dealerId,
    recordedByUserId,
    date,
    amount,
    mode,
    note,
}: PaymentParams) {
    return prisma.$transaction(async (tx) => {
        /* -----------------------------
           1. OPEN academic year
        ------------------------------ */
        const academicYear = await tx.academicYear.findFirst({
            where: { status: "OPEN" },
        });
        if (!academicYear) {
            throw new Error("No open academic year");
        }

        /* -----------------------------
           2. OPEN FlowGroup
        ------------------------------ */
        const flowGroup = await tx.flowGroup.findFirst({
            where: {
                dealerId,
                academicYearId: academicYear.id,
                status: "OPEN",
            },
        });
        if (!flowGroup) {
            throw new Error("No open dealer flow");
        }

        /* -----------------------------
           3. SUPPLIES TOTAL
        ------------------------------ */
        const invoiceAgg = await tx.provisionalInvoice.aggregate({
            where: { flowGroupId: flowGroup.id },
            _sum: { netAmount: true },
        });

        const suppliesTotal =
            invoiceAgg._sum.netAmount ?? new Prisma.Decimal(0);

        /* -----------------------------
           4. PAYMENTS TOTAL (NEGATIVE)
        ------------------------------ */
        const paymentAgg = await tx.payment.aggregate({
            where: { flowGroupId: flowGroup.id },
            _sum: { amount: true },
        });

        const paymentsTotal =
            paymentAgg._sum.amount ?? new Prisma.Decimal(0);

        /* -----------------------------
           5. DEALER RETURNS TOTAL
           (OPTIONAL: include later if priced)
        ------------------------------ */
        // If dealer return value is not price-based yet,
        // skip for now. Can be added later safely.

        /* -----------------------------
           6. OUTSTANDING BALANCE
        ------------------------------ */
        const outstandingDecimal = suppliesTotal.add(paymentsTotal);
        const outstanding = outstandingDecimal.toNumber();

        if (outstanding <= 0) {
            throw new Error("No outstanding balance");
        }

        if (amount > outstanding) {
            throw new Error("Payment exceeds outstanding balance");
        }

        /* -----------------------------
           7. CREATE PAYMENT (NEGATIVE)
        ------------------------------ */
        const payment = await tx.payment.create({
            data: {
                academicYearId: academicYear.id,
                flowGroupId: flowGroup.id,
                receiptNo: `PAY-${Date.now()}`,
                amount: new Prisma.Decimal(-amount),
                mode,
                note,
                recordedByUserId: '529f8034-ec1b-47bc-8a3a-22fb60c03fcb', // update this later
                createdAt: date,
            },
        });

        /* -----------------------------
           8. AUTO-SETTLE FLOW
        ------------------------------ */
        const remaining = outstanding - amount;

        if (remaining === 0) {
            await tx.flowGroup.update({
                where: { id: flowGroup.id },
                data: { status: "SETTLED" },
            });
        }

        return {
            paymentId: payment.id,
            paid: amount,
            remaining,
        };
    });
}

export async function getDealerStatement(dealerId: string) {
    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });
    if (!academicYear) throw new Error("No open academic year");

    const flow = await prisma.flowGroup.findFirst({
        where: {
            dealerId,
            academicYearId: academicYear.id,
        },
    });
    if (!flow) return [];

    const rows: any[] = [];

    /* ---------------- SUPPLIES ---------------- */
    const invoices = await prisma.provisionalInvoice.findMany({
        where: { flowGroupId: flow.id },
        include: { items: true },
    });

    for (const inv of invoices) {
        rows.push({
            date: inv.date,
            type: "SUPPLY",
            reference: inv.invoiceNo,
            debit: inv.netAmount.toNumber(),
            credit: 0,
        });
    }

    /* ---------------- RETURNS ---------------- */
    const returns = await prisma.purchaseReturn.findMany({
        where: { flowGroupId: flow.id },
        include: { items: true },
    });

    for (const r of returns) {
        const amount = r.items.reduce((sum, i) => {
            return sum + i.qtyReturned * i.unitPrice.toNumber();
        }, 0);

        rows.push({
            date: r.date,
            type: "RETURN",
            reference: `RET-${r.id.slice(0, 6)}`,
            debit: 0,
            credit: amount,
        });
    }

    /* ---------------- PAYMENTS ---------------- */
    const payments = await prisma.payment.findMany({
        where: { flowGroupId: flow.id },
    });

    for (const p of payments) {
        rows.push({
            date: p.createdAt,
            type: "PAYMENT",
            reference: p.receiptNo,
            debit: 0,
            credit: Math.abs(p.amount.toNumber()),
        });
    }

    /* ---------------- SORT + BALANCE ---------------- */
    rows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let balance = 0;
    return rows.map((r) => {
        balance += r.debit - r.credit;
        return {
            ...r,
            date: r.date.toISOString(),
            balance,
        };
    });
}