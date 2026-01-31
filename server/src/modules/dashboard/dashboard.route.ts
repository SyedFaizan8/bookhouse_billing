import { prisma } from "../../prisma.js";
import { DocumentKind } from "../../generated/prisma/enums.js";
import type { Request, Response } from "express";
import { Router } from "express";
import { AppError } from "../../utils/error.js";
import { asyncHandler } from "../../utils/async.js";

const router = Router();

router.get("/", asyncHandler(async (_req: Request, res: Response) => {

    const round = (n: number) => Number(Number(n).toFixed(2));

    /* =============================
       1️⃣ OPEN ACADEMIC YEAR
    ============================= */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
        },
    });

    if (!academicYear) throw new AppError("No open academic year found", 404);

    const yearId = academicYear.id;

    /* =============================
       2️⃣ COUNTS + TOTALS
    ============================= */

    const [
        schoolsCount,
        companiesCount,
        usersCount,

        invoiceAgg,
        creditAgg,
        paymentAgg,
    ] = await Promise.all([

        prisma.school.count({
            where: { active: true },
        }),

        prisma.company.count({
            where: { active: true },
        }),

        prisma.user.count(),

        // SALES (schools only)
        prisma.invoice.aggregate({
            where: {
                kind: DocumentKind.INVOICE,
                flowGroup: {
                    academicYearId: yearId,
                    schoolId: { not: null },
                },
            },
            _sum: { netAmount: true },
        }),

        // CREDIT NOTES
        prisma.invoice.aggregate({
            where: {
                kind: DocumentKind.CREDIT_NOTE,
                flowGroup: {
                    academicYearId: yearId,
                    schoolId: { not: null },
                },
            },
            _sum: { netAmount: true },
        }),

        // PAYMENTS
        prisma.payment.aggregate({
            where: {
                academicYearId: yearId,
                flowGroup: {
                    schoolId: { not: null },
                },
            },
            _sum: { amount: true },
        }),
    ]);

    const totalSales =
        round(Number(invoiceAgg._sum.netAmount || 0)) -
        round(Number(creditAgg._sum.netAmount || 0));

    const totalPaid = round(Number(paymentAgg._sum.amount || 0));

    const outstanding = round(totalSales - totalPaid);

    /* =============================
       3️⃣ FETCH MONTHLY DATA
    ============================= */

    const invoices = await prisma.invoice.findMany({
        where: {
            kind: DocumentKind.INVOICE,
            flowGroup: {
                academicYearId: yearId,
                schoolId: { not: null },
            },
        },
        select: {
            date: true,
            netAmount: true,
        },
    });

    const payments = await prisma.payment.findMany({
        where: {
            academicYearId: yearId,
            flowGroup: {
                schoolId: { not: null },
            },
        },
        select: {
            createdAt: true,
            amount: true,
        },
    });

    /* =============================
       4️⃣ MONTH MAP
    ============================= */

    const monthMap: Record<
        string,
        { invoice: number; payment: number }
    > = {};

    for (const inv of invoices) {
        const key = inv.date.getMonth(); // 0–11
        monthMap[key] ??= { invoice: 0, payment: 0 };
        monthMap[key].invoice += Number(inv.netAmount);
    }

    for (const pay of payments) {
        const key = pay.createdAt.getMonth();
        monthMap[key] ??= { invoice: 0, payment: 0 };
        monthMap[key].payment += Number(pay.amount);
    }

    /* =============================
       5️⃣ BUILD MONTH LABELS
    ============================= */

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthly = monthNames.map((label, index) => ({
        month: label,
        invoice: round(monthMap[index]?.invoice || 0),
        payment: round(monthMap[index]?.payment || 0),
    }));

    /* =============================
       6️⃣ RESPONSE
    ============================= */

    res.json({
        academicYear: academicYear.name,

        cards: {
            schools: schoolsCount,
            companies: companiesCount,
            users: usersCount,
            totalSales,
            totalPaid,
            outstanding,
        },

        monthly,
    });
}))

function qs(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined
}


router.get("/documents", asyncHandler(async (req: Request, res: Response) => {

    const party = qs(req.query.party) as "SCHOOL" | "COMPANY"

    if (!party) {
        throw new AppError("party is required", 400)
    }

    const partyId = qs(req.query.partyId)
    const type = qs(req.query.type) ?? "ALL"
    const month = qs(req.query.month)
    const fromStr = qs(req.query.from)
    const toStr = qs(req.query.to)
    const cursor = qs(req.query.cursor)
    const limit = Number(req.query.limit ?? 20)

    let dateFilter: any

    if (month) {
        const s = new Date(`${month}-01`)
        const e = new Date(s)
        e.setMonth(e.getMonth() + 1)
        dateFilter = { gte: s, lt: e }
    }

    if (fromStr && toStr) {
        dateFilter = {
            gte: new Date(fromStr),
            lte: new Date(toStr),
        }
    }

    const activeYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    })

    if (!activeYear) throw new AppError("No active academic year found", 400)

    const flowPartyFilter =
        party === "SCHOOL"
            ? { schoolId: partyId ? partyId : { not: null } }
            : { companyId: partyId ? partyId : { not: null } }


    // ============================
    // CASE 1: ALL (special)
    // ============================
    if (type === "ALL") {
        const invoices = await prisma.invoice.findMany({
            where: {
                ...(dateFilter && { date: dateFilter }),
                flowGroup: {
                    academicYearId: activeYear.id,
                    ...flowPartyFilter,
                }
            },
            include: {
                flowGroup: { include: { school: true, company: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        })

        const payments = await prisma.payment.findMany({
            where: {
                academicYearId: activeYear.id,
                ...(dateFilter && { createdAt: dateFilter }),
                flowGroup: flowPartyFilter
            },
            include: {
                flowGroup: { include: { school: true, company: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        })

        const merged = [
            ...invoices.map((i) => ({
                id: i.id,
                docNo: i.documentNo,
                kind: i.kind,
                date: i.date.toISOString(),
                amount: i.netAmount.toString(),
                status: i.status,
                party:
                    i.flowGroup.school?.name ??
                    i.flowGroup.company?.name ??
                    "-",
                partyId:
                    i.flowGroup.school?.id ??
                    i.flowGroup.company?.id ??
                    "-",
                partyType: i.flowGroup.schoolId
                    ? "SCHOOL"
                    : "COMPANY",
            })),

            ...payments.map((p) => ({
                id: p.id,
                docNo: p.receiptNo.toString(),
                kind: "PAYMENT",
                date: p.createdAt.toISOString(),
                amount: p.amount.toString(),
                status: p.status,
                party:
                    p.flowGroup.school?.name ??
                    p.flowGroup.company?.name ??
                    "-",
                partyId:
                    p.flowGroup.school?.id ??
                    p.flowGroup.company?.id ??
                    "-",
                partyType: p.flowGroup.schoolId
                    ? "SCHOOL"
                    : "COMPANY",
            })),
        ]

        merged.sort(
            (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
        )

        const start = cursor
            ? merged.findIndex((d) => d.id === cursor) + 1
            : 0

        const pageItems = merged.slice(
            start,
            start + limit
        )

        const nextCursor =
            merged[start + limit]?.id ?? null

        return res.json({
            items: pageItems,
            nextCursor,
        })
    }

    // ============================
    // CASE 2: PAYMENT ONLY
    // ============================
    if (type === "PAYMENT") {
        const payments = await prisma.payment.findMany({
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            where: {
                academicYearId: activeYear.id,
                ...(dateFilter && { createdAt: dateFilter }),
                flowGroup: flowPartyFilter,
            },
            include: {
                flowGroup: { include: { school: true, company: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        const rows = payments.map((p) => ({
            id: p.id,
            docNo: p.receiptNo.toString(),
            kind: "PAYMENT",
            date: p.createdAt.toISOString(),
            amount: p.amount.toString(),
            status: p.status,
            party:
                p.flowGroup.school?.name ??
                p.flowGroup.company?.name ??
                "-",
            partyId:
                p.flowGroup.school?.id ??
                p.flowGroup.company?.id ??
                "-",
            partyType: p.flowGroup.schoolId
                ? "SCHOOL"
                : "COMPANY",
        }))

        return res.json({
            items: rows.slice(0, limit),
            nextCursor:
                rows.length > limit
                    ? rows[limit - 1].id
                    : null,
        })
    }

    // ============================
    // CASE 3: INVOICE / CREDIT NOTE
    // ============================
    const kinds: DocumentKind[] =
        type === "INVOICE"
            ? ["INVOICE"]
            : ["CREDIT_NOTE"]

    const invoices = await prisma.invoice.findMany({
        take: limit + 1,
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1,
        }),
        where: {
            kind: { in: kinds },
            ...(dateFilter && { date: dateFilter }),
            flowGroup: flowPartyFilter,
        },
        include: {
            flowGroup: { include: { school: true, company: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    const rows = invoices.map((i) => ({
        id: i.id,
        docNo: i.documentNo,
        kind: i.kind,
        date: i.date.toISOString(),
        amount: i.netAmount.toString(),
        status: i.status,
        party:
            i.flowGroup.school?.name ??
            i.flowGroup.company?.name ??
            "-",
        partyId:
            i.flowGroup.school?.id ??
            i.flowGroup.company?.id ??
            "-",
        partyType: i.flowGroup.schoolId
            ? "SCHOOL"
            : "COMPANY",
    }))

    res.json({
        items: rows.slice(0, limit),
        nextCursor:
            rows.length > limit
                ? rows[limit - 1].id
                : null,
    })
}))

export default router;
