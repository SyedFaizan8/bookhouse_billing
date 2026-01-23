import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma"
import { PrismaClient } from "../../generated/prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/client";
import { customerCreateSchema, paymentSchema } from "./customer.schema";

export async function getCustomerProfile(req: Request, res: Response) {

    const customerId = req.params.id

    const customer = await prisma.customer.findUnique({
        where: { id: customerId }
    })

    if (!customer) throw new Error("Customer not found")

    return res.json(customer)

}

export async function getCustomerInvoices(req: Request, res: Response) {
    try {
        const customerId = req.params.id;

        // 🔹 get open academic year
        const academicYear = await prisma.academicYear.findFirst({
            where: { status: "OPEN" },
            select: { id: true },
        });

        if (!academicYear) {
            return res.status(401).json({ message: "create academic Year first" });
        }

        // 🔹 get invoices directly using relation filter
        const invoices = await prisma.provisionalInvoice.findMany({
            where: {
                flowGroup: {
                    customerId,
                    academicYearId: academicYear.id,
                },
            },
            orderBy: {
                date: "desc",
            },
            select: {
                id: true,
                invoiceNo: true,
                date: true,
                totalQuantity: true,
                netAmount: true,
                createdAt: true,
            },
        });

        return res.json(
            invoices.map((inv) => ({
                id: inv.id,
                invoiceNo: inv.invoiceNo,
                date: inv.date,
                totalQty: inv.totalQuantity,
                amount: inv.netAmount.toNumber(),
                createdAt: inv.createdAt,
            }))
        );

    } catch (error) {
        console.error("getCustomerInvoices error:", error);
        return res.status(500).json({
            message: "Failed to fetch invoices",
        });
    }
}

export async function customerReturns(req: Request, res: Response) {

    const customerId = req.params.id

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    if (!academicYear) {
        return Response.json({ message: "No active academic year" }, { status: 400 });
    }

    const invoices = await prisma.provisionalInvoice.findMany({
        where: {
            flowGroup: {
                customerId,
                academicYearId: academicYear.id,
            },
        },
        include: {
            items: {
                include: {
                    textbook: true,
                },
            },
            salesReturns: {
                include: {
                    items: true,
                },
            },
        },
        orderBy: { date: "desc" },
    });

    // 🔒 calculate remaining return qty
    const result = invoices.map((inv) => {
        const returnedMap = new Map<string, number>();

        inv.salesReturns.forEach((sr) => {
            sr.items.forEach((it) => {
                returnedMap.set(
                    it.textbookId,
                    (returnedMap.get(it.textbookId) || 0) + it.qtyReturned
                );
            });
        });

        return {
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            date: inv.date,
            flowGroupId: inv.flowGroupId,
            items: inv.items.map((i) => ({
                textbookId: i.textbookId,
                title: i.textbook.title,
                issuedQty: i.quantity,
                alreadyReturned: returnedMap.get(i.textbookId) || 0,
                remainingQty:
                    i.quantity - (returnedMap.get(i.textbookId) || 0),
            })),
        }
    });

    return res.json([...result])
}
type txType = Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

async function generateReceiptNo(tx: txType, academicYearId: string) {
    const seq = await tx.documentSequence.upsert({
        where: {
            academicYearId_type: {
                academicYearId,
                type: "PAYMENT",
            },
        },
        update: {
            lastNumber: { increment: 1 },
        },
        create: {
            academicYearId,
            type: "PAYMENT",
            lastNumber: 1,
        },
    });

    return `RCPT-${String(seq.lastNumber)}`;
}

export async function createCustomerPayment(req: Request, res: Response) {

    try {
        const customerId = req.params.id;

        const {
            amount,
            referenceNo,
            note,
            mode,
            recordedByUserId,
        } = paymentSchema.parse(req.body);

        const result = await prisma.$transaction(async (tx) => {

            /* -----------------------------------------
               1. OPEN ACADEMIC YEAR
            ----------------------------------------- */

            const academicYear = await tx.academicYear.findFirst({
                where: { status: "OPEN" },
                select: { id: true },
            });

            if (!academicYear) {
                throw new Error("No active academic year");
            }

            /* -----------------------------------------
               2. OPEN FLOW GROUP
            ----------------------------------------- */

            const flowGroup = await tx.flowGroup.findFirst({
                where: {
                    customerId,
                    academicYearId: academicYear.id,
                    status: "OPEN",
                },
                select: { id: true },
            });

            if (!flowGroup) {
                throw new Error("No open flow found for this customer");
            }

            /* -----------------------------------------
               3. RECEIPT NUMBER
            ----------------------------------------- */

            const receiptNo = await generateReceiptNo(
                tx,
                academicYear.id
            );

            /* -----------------------------------------
               4. CREATE PAYMENT
            ----------------------------------------- */

            return tx.payment.create({
                data: {
                    academicYearId: academicYear.id,
                    flowGroupId: flowGroup.id,
                    receiptNo,
                    amount,
                    mode,
                    note:
                        mode === "BANK" && referenceNo
                            ? `Ref: ${referenceNo}`
                            : note ?? null,
                    recordedByUserId,
                },
            });
        });

        return res.json({
            success: true,
            payment: result,
        });

    } catch (error: any) {
        console.error("Create payment error:", error);

        return res.status(400).json({
            message: error.message ?? "Failed to record payment",
        });
    }
}


export async function listCustomerPayments(req: Request, res: Response) {
    const customerId = req.params.id;

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    const payments = await prisma.payment.findMany({
        where: {
            flowGroup: {
                customerId,
                academicYearId: academicYear?.id,
            },
        },
        orderBy: { createdAt: "desc" },
    });

    res.json(
        payments.map((p) => ({
            id: p.id,
            receiptNo: p.receiptNo,
            amount: Number(p.amount),
            mode: p.mode,
            note: p.note,
            date: p.createdAt,
        }))
    );
}


// export async function customerStatement(req: Request, res: Response) {
//     const customerId = req.params.id;

//     const academicYear = await prisma.academicYear.findFirst({
//         where: { status: "OPEN" },
//     });

//     if (!academicYear)
//         return res.status(400).json({ message: "No active academic year" });

//     const flowGroups = await prisma.flowGroup.findMany({
//         where: {
//             academicYearId: academicYear.id,
//             customerId,
//         },
//         include: {
//             provisionalInvoices: true,
//             salesReturns: {
//                 include: { items: true },
//             },
//             payments: true,
//         },
//         orderBy: { createdAt: "asc" },
//     });

//     const rows: any[] = [];

//     flowGroups.forEach((flow) => {
//         // INVOICES (DEBIT)
//         flow.provisionalInvoices.forEach((inv) => {
//             rows.push({
//                 date: inv.date,
//                 type: "Invoice",
//                 ref: inv.invoiceNo,
//                 debit: Number(inv.netAmount),
//                 credit: 0,
//             });
//         });

//         // SALES RETURNS (CREDIT)
//         flow.salesReturns.forEach((sr) => {
//             const amount = sr.items.reduce(
//                 (s, i) => s + i.qtyReturned * 1, // price already in invoice
//                 0
//             );

//             rows.push({
//                 date: sr.date,
//                 type: "Sales Return",
//                 ref: sr.id.slice(0, 8),
//                 debit: 0,
//                 credit: amount,
//             });
//         });

//         // PAYMENTS
//         flow.payments.forEach((p) => {
//             rows.push({
//                 date: p.createdAt,
//                 type: "Payment",
//                 ref: p.receiptNo,
//                 debit: 0,
//                 credit: Number(p.amount),
//             });
//         });
//     });

//     // sort by date
//     rows.sort((a, b) => +new Date(a.date) - +new Date(b.date));

//     // running balance
//     let balance = 0;

//     const statement = rows.map((r) => {
//         balance += r.debit - r.credit;
//         return { ...r, balance };
//     });

//     res.json(statement);
// }

export async function customerStatement(req: Request, res: Response) {
    const customerId = req.params.id;

    /* -----------------------------------------
       1. OPEN ACADEMIC YEAR
    ----------------------------------------- */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    if (!academicYear) {
        return res.status(400).json({
            message: "No active academic year",
        });
    }

    /* -----------------------------------------
       2. FETCH COMPANY + CUSTOMER
    ----------------------------------------- */

    const [company, customer] = await Promise.all([
        prisma.companyInfo.findFirst(),
        prisma.customer.findUnique({
            where: { id: customerId },
        }),
    ]);

    if (!company || !customer) {
        return res.status(404).json({
            message: "Company or customer not found",
        });
    }

    /* -----------------------------------------
       3. FETCH ALL CUSTOMER FLOWS
    ----------------------------------------- */

    const flowGroups = await prisma.flowGroup.findMany({
        where: {
            academicYearId: academicYear.id,
            customerId,
        },
        include: {
            provisionalInvoices: {
                include: {
                    items: true,
                },
            },
            salesReturns: {
                include: {
                    provisionalInvoice: {
                        include: {
                            items: true,
                        },
                    },
                    items: true,
                },
            },
            payments: true,
        },
    });

    const rows: {
        date: Date;
        type: string;
        ref: string;
        debit: number;
        credit: number;
    }[] = [];

    /* -----------------------------------------
       4. BUILD STATEMENT ROWS
    ----------------------------------------- */

    for (const flow of flowGroups) {
        /* ---------- INVOICES (DEBIT) ---------- */
        for (const inv of flow.provisionalInvoices) {
            rows.push({
                date: inv.date,
                type: "Invoice",
                ref: inv.invoiceNo,
                debit: Number(inv.netAmount),
                credit: 0,
            });
        }

        /* ---------- SALES RETURNS (CREDIT) ---------- */
        for (const sr of flow.salesReturns) {
            let returnAmount = 0;

            for (const item of sr.items) {
                const invoiceItem =
                    sr.provisionalInvoice.items.find(
                        (i) => i.textbookId === item.textbookId
                    );

                if (invoiceItem) {
                    const unitNet =
                        Number(invoiceItem.netAmount) /
                        invoiceItem.quantity;

                    returnAmount += unitNet * item.qtyReturned;
                }
            }

            rows.push({
                date: sr.date,
                type: "Sales Return",
                ref: `SR-${sr.id.slice(0, 6)}`,
                debit: 0,
                credit: Number(returnAmount.toFixed(2)),
            });
        }

        /* ---------- PAYMENTS (CREDIT) ---------- */
        for (const p of flow.payments) {
            rows.push({
                date: p.createdAt,
                type: "Payment",
                ref: p.receiptNo,
                debit: 0,
                credit: Number(p.amount),
            });
        }
    }

    /* -----------------------------------------
       5. SORT BY DATE
    ----------------------------------------- */

    rows.sort(
        (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
    );

    /* -----------------------------------------
       6. RUNNING BALANCE
    ----------------------------------------- */

    let balance = 0;

    const statement = rows.map((r) => {
        balance += r.debit - r.credit;

        return {
            ...r,
            balance: Number(balance.toFixed(2)),
        };
    });

    /* -----------------------------------------
       7. RESPONSE
    ----------------------------------------- */

    return res.json({
        company: {
            name: company.name,
            address: `${company.town ?? ""}, ${company.district ?? ""}`,
            phone: company.phone,
            gst: company.gst,
        },
        customer: {
            name: customer.name,
            phone: customer.phone,
            gst: customer.gst,
            address: `${customer.town ?? ""}, ${customer.district ?? ""}`,
        },
        rows: statement,
    });
}


export async function getAllCustomers(req: Request, res: Response) {
    const {
        cursor,
        limit = "50",
        sort = "addedOn",
        order = "desc",
        search = "",
    } = req.query;

    const take = Math.min(Number(limit) || 50, 100);

    // 🔒 map frontend → db
    const sortMap: Record<string, "name" | "createdAt"> = {
        name: "name",
        addedOn: "createdAt",
        amountDue: "createdAt",
    };

    const sortField = sortMap[String(sort)] || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const customers = await prisma.customer.findMany({
        take: take + 1,
        ...(cursor && {
            cursor: { id: cursor as string },
            skip: 1,
        }),
        where: {
            active: true,
            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search as string,
                                mode: "insensitive",
                            },
                        },
                        {
                            phone: {
                                contains: search as string,
                            },
                        },
                    ],
                }
                : {}),
        },
        orderBy: {
            [sortField]: sortOrder,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
            flows: {
                select: {
                    provisionalInvoices: {
                        select: { netAmount: true },
                    },
                    payments: {
                        select: { amount: true },
                    },
                },
            },
        },
    });

    const hasNextPage = customers.length > take;
    const items = customers.slice(0, take);

    const result = items.map((c) => {
        const totalInvoiced = c.flows.flatMap(f =>
            f.provisionalInvoices.map(i => Number(i.netAmount))
        );

        const totalPaid = c.flows.flatMap(f =>
            f.payments.map(p => Number(p.amount))
        );

        const invoiced = totalInvoiced.reduce((a, b) => a + b, 0);
        const paid = totalPaid.reduce((a, b) => a + b, 0);

        return {
            id: c.id,
            name: c.name,
            phone: c.phone,
            addedOn: c.createdAt,
            amountDue: invoiced - paid,
        };
    });

    res.json({
        items: result,
        nextCursor: hasNextPage
            ? items[items.length - 1].id
            : null,
    });
}


export const createCustomer = async (req: Request, res: Response) => {
    try {
        // ✅ validate input
        const data = customerCreateSchema.parse(req.body);

        // ✅ optional duplicate check
        const existing = await prisma.customer.findFirst({
            where: { phone: data.phone },
        });

        if (existing) {
            return res.status(409).json({
                message: "Customer with this phone already exists",
            });
        }

        const customer = await prisma.customer.create({
            data,
        });

        return res.status(201).json(customer);
    } catch (err: any) {
        if (err?.name === "ZodError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: err.errors,
            });
        }

        console.error(err);
        return res.status(500).json({
            message: "Failed to create customer",
        });
    }
}

export const getCustomerProfileEdit = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;

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
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
            });
        }

        return res.json(customer);
    } catch (error) {
        console.error("Customer edit fetch error:", error);

        return res.status(500).json({
            message: "Failed to fetch customer profile",
        });
    }
}

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const payload = customerCreateSchema.parse(req.body);

        const existing = await prisma.customer.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({
                message: "Customer not found",
            });
        }

        // 🔥 remove undefined values
        const cleanData = Object.fromEntries(
            Object.entries(payload).filter(
                ([_, v]) => v !== undefined
            )
        );

        const updated = await prisma.customer.update({
            where: { id },
            data: cleanData,
        });

        return res.json(updated);
    } catch (error: any) {
        return res.status(400).json({
            message: error.message,
        });
    }
}