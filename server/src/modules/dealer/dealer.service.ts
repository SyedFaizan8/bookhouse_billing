import { prisma } from "../../lib/prisma.js";

type SortOrder = "asc" | "desc"

type DealerOrderBy =
    NonNullable<
        Parameters<typeof prisma.dealer.findMany>[0]
    >["orderBy"]

type ListParams = {
    cursor?: string
    limit: number
    sortBy: "name" | "addedOn" | "amountDue"
    order: SortOrder
}

export class DealerService {

    // ✅ LIST DEALERS WITH AMOUNT DUE
    async listPaginated({
        cursor,
        limit,
        sortBy,
        order,
    }: ListParams) {
        const orderBy: DealerOrderBy =
            sortBy === "name"
                ? { name: order }
                : { createdAt: order }

        const dealers = await prisma.dealer.findMany({
            where: { active: true },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy,
            select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true,
                active: true,
                deactivatedAt: true,
            },
        })

        const hasNextPage = dealers.length > limit
        const items = dealers.slice(0, limit)

        return {
            items: items.map((d) => ({
                id: d.id,
                name: d.name,
                phone: d.phone,
                amountDue: 0,
                addedOn: d.createdAt,
                active: d.active,
                deactivatedAt: d.deactivatedAt,
            })),
            nextCursor: hasNextPage
                ? items[items.length - 1].id
                : null,
        }
    }

    // ✅ CREATE DEALER
    async create(data: any) {
        return prisma.dealer.create({
            data,
        });
    }

    // GET PROFILE TO EDIT
    async getDealerProfileEdit(dealerId: string) {
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
            },
        })

        if (!dealer) return null

        return {
            id: dealer.id,
            name: dealer.name,
            phone: dealer.phone,
            email: dealer.email,
            street: dealer.street,
            town: dealer.town,
            district: dealer.district,
            state: dealer.state,
            pincode: dealer.pincode,
            gst: dealer.gst,
            bankName: dealer.bankName,
            accountNo: dealer.accountNo,
            ifsc: dealer.ifsc
        }
    }

    // ✅ UPDATE DEALER
    async update(id: string, data: any) {

        const existing = await prisma.dealer.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error("Dealer not found");
        }

        return prisma.dealer.update({
            where: { id },
            data,
        });
    }

    // ✅ ACTIVATE / DEACTIVATE DEALER
    async setActive(id: string, active: boolean) {
        return prisma.dealer.update({
            where: { id },
            data: {
                active,
                deactivatedAt: active ? null : new Date(),
            },
        });
    }

    // ✅ ENTER DEALER INVOICE (PURCHASE)
    async createPurchase(data: any) {
        return prisma.$transaction(async (tx) => {
            // 1️⃣ Calculate invoice total
            const totalAmount = data.items.reduce(
                (sum: number, item: any) =>
                    sum + item.quantity * item.purchasePrice,
                0
            );

            // 2️⃣ Create purchase invoice
            const invoice = await tx.purchaseInvoice.create({
                data: {
                    dealerId: data.dealerId,
                    invoiceNo: data.invoiceNo,
                    totalAmount,
                    balance: totalAmount,
                },
            });

            // 3️⃣ Process each item
            for (const item of data.items) {
                let textbookId = item.textbookId;

                // 🔍 3A: Resolve textbook (auto-create if needed)
                if (!textbookId) {
                    const existingTextbook = await tx.textbook.findFirst({
                        where: {
                            title: item.title,
                            dealerId: data.dealerId,
                            class: item.class,
                            subject: item.subject,
                            medium: item.medium,
                            editionYear: item.editionYear,
                        },
                    });

                    if (existingTextbook) {
                        textbookId = existingTextbook.id;
                    } else {
                        const newTextbook = await tx.textbook.create({
                            data: {
                                title: item.title,
                                dealerId: data.dealerId,
                                class: item.class,
                                subject: item.subject,
                                medium: item.medium,
                                editionYear: item.editionYear,
                                mrp: item.mrp,
                                sellingPrice: item.sellingPrice,
                            },
                        });

                        textbookId = newTextbook.id;

                        // Initialize stock for new textbook
                        await tx.stock.create({
                            data: {
                                textbookId,
                                quantity: 0,
                            },
                        });
                    }
                }

                // 🧾 3B: Create purchase invoice item
                await tx.purchaseInvoiceItem.create({
                    data: {
                        purchaseInvoiceId: invoice.id,
                        textbookId,
                        quantity: item.quantity,
                        purchasePrice: item.purchasePrice,
                        totalPrice: item.quantity * item.purchasePrice,
                    },
                });

                // 📦 3C: STOCK IN
                await tx.stock.update({
                    where: { textbookId },
                    data: {
                        quantity: { increment: item.quantity },
                    },
                });

                // 🧾 3D: STOCK LEDGER
                await tx.stockLedger.create({
                    data: {
                        textbookId,
                        type: "IN",
                        quantity: item.quantity,
                        note: `Dealer invoice ${data.invoiceNo}`,
                    },
                });
            }

            return invoice;
        });
    }


    // ✅ PAY DEALER
    async payDealer(purchaseInvoiceId: string, data: any) {
        return prisma.$transaction(async (tx) => {
            const invoice = await tx.purchaseInvoice.findUnique({
                where: { id: purchaseInvoiceId },
            });

            if (!invoice) throw new Error("Invoice not found");

            if (data.amount > Number(invoice.balance)) {
                throw new Error("Payment exceeds balance");
            }

            await tx.dealerPayment.create({
                data: {
                    purchaseInvoiceId,
                    amount: data.amount,
                    mode: data.mode,
                    referenceNo: data.referenceNo,
                },
            });

            const paid = Number(invoice.paidAmount) + data.amount;
            const balance = Number(invoice.totalAmount) - paid;

            return tx.purchaseInvoice.update({
                where: { id: purchaseInvoiceId },
                data: {
                    paidAmount: paid,
                    balance,
                    status: balance === 0 ? "PAID" : "PARTIALLY_PAID",
                },
            });
        });
    }

    // ✅ DEALER OUTSTANDING
    async getOutstanding(dealerId: string) {
        const invoices = await prisma.purchaseInvoice.findMany({
            where: { dealerId, balance: { gt: 0 } },
            select: {
                invoiceNo: true,
                balance: true,
                createdAt: true,
            },
        });

        const totalOutstanding = invoices.reduce(
            (sum, i) => sum + Number(i.balance),
            0
        );

        return { totalOutstanding, invoices };
    }
}

export const dealerService = new DealerService();
