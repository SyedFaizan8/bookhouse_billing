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
            totalSales,
            totalPaid,
            outstanding,
        },

        monthly,
    });
}))

export default router;
