import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { CreateSalesReturnSchema } from "./sale-returns.schema";

export async function createReturnInvoice(req: Request, res: Response) {

    const parsed = CreateSalesReturnSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.flatten(),
        });
    }

    const { flowGroupId, provisionalInvoiceId, items } = parsed.data;

    if (!items?.length) {
        return Response.json({ message: "No items" }, { status: 400 });
    }

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    if (!academicYear) {
        return Response.json({ message: "No active academic year" }, { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
        const invoice = await tx.provisionalInvoice.findUnique({
            where: { id: provisionalInvoiceId },
            include: {
                items: true,
                salesReturns: {
                    include: { items: true },
                },
                flowGroup: true,
            },
        });

        if (!invoice)
            throw new Error("Invoice not found");

        if (invoice.flowGroup.status === "SETTLED")
            throw new Error("Invoice already settled");

        // 🔒 compute already returned
        const returned = new Map<string, number>();

        invoice.salesReturns.forEach((sr) => {
            sr.items.forEach((i) => {
                returned.set(
                    i.textbookId,
                    (returned.get(i.textbookId) || 0) + i.qtyReturned
                );
            });
        });

        // 🔥 validate
        for (const item of items) {
            const issued = invoice.items.find(
                (i) => i.textbookId === item.textbookId
            );

            if (!issued)
                throw new Error("Invalid textbook");

            const already = returned.get(item.textbookId) || 0;

            if (item.qtyReturned <= 0)
                throw new Error("Invalid qty");

            if (already + item.qtyReturned > issued.quantity) {
                throw new Error(
                    `Return exceeds issued qty for ${issued.textbookId}`
                );
            }
        }

        // ✅ create sales return
        const salesReturn = await tx.salesReturn.create({
            data: {
                flowGroupId,
                provisionalInvoiceId,
                date: new Date(),
                items: {
                    create: items.map((i: any) => ({
                        textbookId: i.textbookId,
                        qtyReturned: i.qtyReturned,
                    })),
                },
            },
        });

        // ✅ stock back
        for (const item of items) {
            await tx.stockLedger.create({
                data: {
                    academicYearId: academicYear.id,
                    textbookId: item.textbookId,
                    qtyChange: item.qtyReturned,
                    eventType: "SALES_RETURN",
                    referenceId: salesReturn.id,
                },
            });
        }

        return res.json(salesReturn);
    });

}