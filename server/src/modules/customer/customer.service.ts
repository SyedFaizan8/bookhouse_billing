import { prisma } from "../../lib/prisma";

export class CustomerService {

    async getCustomerProfile(customerId: string) {

        // 1️⃣ Customer basic info
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                contactPerson: true,
                street: true,
                town: true,
                district: true,
                state: true,
                pincode: true,
                gst: true,
                board: true,
                medium: true,
                active: true,
                createdAt: true,
            },
        });

        if (!customer) return null;

        // 2️⃣ Paid vs unpaid summary
        const invoices = await prisma.invoice.findMany({
            where: {
                customerId,
                status: { not: "CANCELLED" },
            },
            select: {
                totalAmount: true,
                paidAmount: true,
            },
        });

        let paid = 0;
        let unpaid = 0;

        for (const inv of invoices) {
            paid += Number(inv.paidAmount);
            unpaid += Number(inv.totalAmount) - Number(inv.paidAmount);
        }

        const summary = [
            { name: "Paid", amount: paid },
            { name: "Unpaid", amount: unpaid },
        ];

        // 3️⃣ Monthly purchase trend
        const trend = await prisma.$queryRaw<
            { month: Date; total: number }[]
        >`
            SELECT
                DATE_TRUNC('month', "issuedAt") AS month,
                SUM("totalAmount") AS total
            FROM "Invoice"
            WHERE "customerId" = ${customerId}
                AND "status" != 'CANCELLED'
            GROUP BY month
            ORDER BY month;
            `;

        const monthlyTrend = trend.map((t) => ({
            month: t.month.toLocaleString("default", {
                month: "short",
                year: "numeric",
            }),
            amount: Number(t.total),
        }));

        // ✅ Final unified response
        return {
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                contactPerson: customer.contactPerson,
                address: {
                    street: customer.street,
                    town: customer.town,
                    district: customer.district,
                    state: customer.state,
                    pincode: customer.pincode,
                },
                gst: customer.gst,
                board: customer.board,
                medium: customer.medium,
                active: customer.active,
                addedOn: customer.createdAt,
            },
            summary,
            monthlyTrend,
        };
    }
    // CREATE CUSTOMER
    async create(data: any) {
        return prisma.customer.create({
            data,
        });
    }

    // LIST CUSTOMERS
    async listPaginated({
        limit = 500,
        cursor,
        sort = "createdAt",
        order = "desc",
    }: {
        limit?: number
        cursor?: string
        sort?: "name" | "createdAt"
        order?: "asc" | "desc"
    }) {
        const customers = await prisma.customer.findMany({
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },   // ✅ FIX
                skip: 1,
            }),
            where: { active: true },
            orderBy: { [sort]: order },
            select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true,
                invoices: {
                    where: { status: { not: "CANCELLED" } },
                    select: { totalAmount: true, paidAmount: true },
                },
            },
        })

        const hasNextPage = customers.length > limit
        const items = customers.slice(0, limit)

        return {
            items: items.map((c) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                amountDue: c.invoices.reduce(
                    (sum, i) =>
                        sum + (Number(i.totalAmount) - Number(i.paidAmount)),
                    0
                ),
                addedOn: c.createdAt,
            })),
            nextCursor: hasNextPage
                ? items[items.length - 1].id // ✅ cursor = id
                : null,
        }
    }

    // GET PROFILE TO EDIT
    async getCustomerProfileEdit(customerId: string) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                contactPerson: true,
                street: true,
                town: true,
                district: true,
                state: true,
                pincode: true,
                gst: true,
                board: true,
                medium: true,
                active: true,
            },
        })

        if (!customer) return null

        return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            contactPerson: customer.contactPerson,
            street: customer.street,
            town: customer.town,
            district: customer.district,
            state: customer.state,
            pincode: customer.pincode,
            gst: customer.gst,
            board: customer.board,
            medium: customer.medium, // ENGLISH | KANNADA | ...
            active: customer.active,
        }
    }

    // UPDATE CUSTOMER
    async update(id: string, data: any) {

        const existing = await prisma.customer.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new Error("Customer not found");
        }

        return prisma.customer.update({
            where: { id },
            data,
        });
    }

    // ACTIVATE / DEACTIVATE
    async setActive(id: string, active: boolean) {
        return prisma.customer.update({
            where: { id },
            data: { active },
        });
    }
}

export const customerService = new CustomerService();
