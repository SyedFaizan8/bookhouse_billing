import type { Request, Response } from "express";
import { Router } from "express"
import { prisma } from "../../prisma.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";
import { InvoiceStatus, PaymentStatus } from "../../generated/prisma/enums.js";

const router = Router();

router.get("/school/:schoolId", asyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.params;

    if (!schoolId) throw new AppError("School id is required", 400);

    /* =====================================
       1. OPEN ACADEMIC YEAR
    ===================================== */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true, name: true },
    });

    if (!academicYear) throw new AppError("No open academic year found", 404);

    /* =====================================
       2. FLOW GROUPS
    ===================================== */

    const flows = await prisma.flowGroup.findMany({
        where: {
            schoolId,
            academicYearId: academicYear.id,
        },
        select: { id: true },
    });

    if (!flows.length) {
        return res.json({
            academicYear: academicYear.name,
            rows: [],
            closingBalance: 0,
        });
    }

    const flowIds = flows.map(f => f.id);

    /* =====================================
       3. FETCH DOCUMENTS
    ===================================== */

    const invoices = await prisma.invoice.findMany({
        where: {
            flowGroupId: { in: flowIds },
            kind: { in: ["INVOICE", "CREDIT_NOTE"] },
            status: InvoiceStatus.ISSUED
        },
        select: {
            date: true,
            kind: true,
            documentNo: true,
            netAmount: true,
        },
    });

    const payments = await prisma.payment.findMany({
        where: {
            flowGroupId: { in: flowIds },
            academicYearId: academicYear.id,
            status: PaymentStatus.POSTED
        },
        select: {
            createdAt: true,
            receiptNo: true,
            amount: true,
        },
    });

    /* =====================================
       4. NORMALIZE
    ===================================== */

    type Row = {
        date: Date;
        type: string;
        refNo: string;
        debit: number;
        credit: number;
    };

    const rows: Row[] = [];

    for (const inv of invoices) {
        const amount = Number(inv.netAmount);
        const refNo = inv.documentNo;

        if (inv.kind === "INVOICE") {
            rows.push({
                date: inv.date,
                type: "Invoice",
                refNo,
                debit: amount,
                credit: 0,
            });
        }

        if (inv.kind === "CREDIT_NOTE") {
            rows.push({
                date: inv.date,
                type: "Credit Note",
                refNo,
                debit: 0,
                credit: amount,
            });
        }
    }

    for (const pay of payments) {
        rows.push({
            date: pay.createdAt,
            type: "Payment",
            refNo: String(pay.receiptNo),
            debit: 0,
            credit: Number(pay.amount),
        });
    }

    /* =====================================
       5. SORT + BALANCE
    ===================================== */

    rows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = 0;

    const finalRows = rows.map(r => {
        runningBalance += r.debit;
        runningBalance -= r.credit;

        return {
            ...r,
            balance: Number(runningBalance.toFixed(2)),
        };
    });

    /* =====================================
       6. COMPANY + SCHOOL
    ===================================== */
    const school = await prisma.school.findUnique({ where: { id: schoolId } })

    if (!school) throw new AppError('School information missing for this receipt', 400)

    res.json({
        academicYear: academicYear.name,

        school: {
            name: school.name,
            phone: school.phone ?? "",
            email: school.email ?? "",
            street: school.street ?? "",
            town: school.town ?? "",
            district: school.district ?? "",
            state: school.state ?? "",
            pincode: school.pincode ?? "",
            gst: school.gst ?? ""
        },

        rows: finalRows,
        closingBalance: Number(runningBalance.toFixed(2)),
    });
}))

router.get("/company/:companyId", asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;

    if (!companyId) throw new AppError("Company id is required", 400);
    /* ================= OPEN YEAR ================= */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true, name: true },
    });

    if (!academicYear) throw new AppError("No open academic year found", 404);

    /* ================= FLOWS ================= */

    const flows = await prisma.flowGroup.findMany({
        where: {
            companyId,
            academicYearId: academicYear.id
        },
        select: { id: true },
    });

    if (!flows.length) {
        return res.json({
            academicYear: academicYear.name,
            rows: [],
            closingBalance: 0,
        });
    }

    const flowIds = flows.map(f => f.id);

    /* ================= DOCUMENTS ================= */

    const invoices = await prisma.invoice.findMany({
        where: {
            flowGroupId: { in: flowIds },
            kind: { in: ["INVOICE", "CREDIT_NOTE"] },
            status: InvoiceStatus.ISSUED
        },
        select: {
            date: true,
            kind: true,
            documentNo: true,
            netAmount: true,
        },
    });

    const payments = await prisma.payment.findMany({
        where: {
            flowGroupId: { in: flowIds },
            academicYearId: academicYear.id,
            status: PaymentStatus.POSTED
        },
        select: {
            createdAt: true,
            receiptNo: true,
            amount: true,
        },
    });

    /* ================= NORMALIZE ================= */

    const rows: any[] = [];

    for (const inv of invoices) {
        const amount = Number(inv.netAmount);

        if (inv.kind === "INVOICE") {
            // purchase invoice → liability
            rows.push({
                date: inv.date,
                type: "Purchase Invoice",
                refNo: String(inv.documentNo),
                debit: 0,
                credit: amount,
            });
        }

        if (inv.kind === "CREDIT_NOTE") {
            rows.push({
                date: inv.date,
                type: "Credit Note",
                refNo: String(inv.documentNo),
                debit: amount,
                credit: 0,
            });
        }
    }

    for (const pay of payments) {
        rows.push({
            date: pay.createdAt,
            type: "Payment",
            refNo: String(pay.receiptNo),
            debit: Number(pay.amount),
            credit: 0,
        });
    }

    /* ================= BALANCE ================= */

    rows.sort((a, b) => a.date.getTime() - b.date.getTime());

    let balance = 0;

    const finalRows = rows.map(r => {
        balance += r.debit;
        balance -= r.credit;

        return {
            ...r,
            balance: Number(balance.toFixed(2)),
        };
    });

    /* ================= META ================= */

    const company = await prisma.company.findUnique({ where: { id: companyId } })

    if (!company) throw new AppError('Unable to find Company Information', 404)

    res.json({
        academicYear: academicYear.name,

        company: {
            name: company?.name,
            phone: company?.phone,
            email: company?.email,

            street: company?.street,
            town: company?.town,
            district: company?.district,
            state: company?.state,
            pincode: company?.pincode,

            gst: company?.gst
        },

        rows: finalRows,
        closingBalance: Number(balance.toFixed(2)),
    });
}))



export default router;