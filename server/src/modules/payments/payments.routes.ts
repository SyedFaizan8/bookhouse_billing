import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { paymentCompanySchema, paymentSchema } from "../school/school.schema.js";
import { AcademicYearStatus, DocumentKind, FlowStatus, PaymentStatus, SequenceScope } from "../../generated/prisma/enums.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";
import { requireAdmin } from "../../middlewares/requireAdmin.middleware.js";

const router = Router();

// GET ALL SCHOOL RECEIPTS
router.get("/school/:schoolId", asyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.params;

    if (!schoolId) throw new AppError('School ID is required', 400)

    /* ======================================================
       1. OPEN ACADEMIC YEAR
    ====================================================== */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    if (!academicYear) throw new AppError('academic year does not exist', 400)

    /* ======================================================
       2. FLOW GROUP (SCHOOL SETTLEMENT)
    ====================================================== */

    const flowGroup = await prisma.flowGroup.findFirst({
        where: {
            schoolId,
            companyId: null,
            academicYearId: academicYear.id,
            status: "OPEN",
        },
    });

    if (!flowGroup) throw new AppError('flowgroup does not exist', 400)

    /* ======================================================
       3. PAYMENTS
    ====================================================== */

    const payments = await prisma.payment.findMany({
        where: {
            flowGroupId: flowGroup.id,
            academicYearId: academicYear.id,
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return res.json(payments.map((p) => ({
        id: p.id,
        receiptNo: p.receiptNo,
        amount: p.amount.toNumber(),
        mode: p.mode,
        note: p.note,
        status: p.status,
        date: p.createdAt
    })),
    );
}))

// GET COMPANY ALL RECEIPTS
router.get("/company/:companyId", asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;

    if (!companyId) throw new AppError('Company ID is required', 400)

    /* ======================================================
       1. OPEN ACADEMIC YEAR
    ====================================================== */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    if (!academicYear) throw new AppError('academic year does not exist', 400)

    /* ======================================================
       2. FLOW GROUP (SCHOOL SETTLEMENT)
    ====================================================== */

    const flowGroup = await prisma.flowGroup.findFirst({
        where: {
            companyId,
            schoolId: null,
            academicYearId: academicYear.id,
            status: "OPEN",
        },
    });

    if (!flowGroup) throw new AppError('flowgroup does not exist', 400)

    /* ======================================================
       3. PAYMENTS
    ====================================================== */

    const payments = await prisma.payment.findMany({
        where: {
            flowGroupId: flowGroup.id,
            academicYearId: academicYear.id,
        },
        orderBy: {
            createdAt: "desc",
        }
    });

    return res.json(payments.map((p) => ({
        id: p.id,
        receiptNo: p.receiptNo,
        amount: p.amount.toNumber(),
        mode: p.mode,
        note: p.note,
        status: p.status,
        date: p.createdAt
    })),
    );
}))


router.post('/school/:schoolId', asyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.params;

    const {
        data,
        error
    } = paymentSchema.safeParse(req.body);

    if (error) throw new AppError('Validation Failed', 409)

    const {
        amount,
        mode,
        referenceNo,
        note,
        receiptNo: userReceiptNo,
        recordedByUserId
    } = data

    const result = await prisma.$transaction(async (tx) => {

        /* 1. OPEN ACADEMIC YEAR */
        const academicYear = await tx.academicYear.findFirst({
            where: { status: "OPEN" },
        });

        if (!academicYear) throw new AppError("No open academic year", 404);

        /* 2. FLOW GROUP */
        let flowGroup = await tx.flowGroup.findFirst({
            where: {
                schoolId,
                companyId: null,
                academicYearId: academicYear.id,
                status: "OPEN",
            },
        });

        if (!flowGroup) {
            flowGroup = await tx.flowGroup.create({
                data: {
                    schoolId,
                    academicYearId: academicYear.id,
                    status: "OPEN",
                },
            });
        }

        /* 3. RECEIPT NUMBER */
        const seq = await tx.documentSequence.findUnique({
            where: {
                academicYearId_type_scope: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PAYMENT,
                    scope: SequenceScope.SCHOOL
                },
            }
        });
        let finalReceiptNo: number;

        if (userReceiptNo) {
            const userNo = Number(userReceiptNo);

            if (Number.isNaN(userNo) || userNo <= 0) {
                throw new Error("Invalid receipt number");
            }

            finalReceiptNo = Math.max(seq?.lastNumber ?? 0, userNo);

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type_scope: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.PAYMENT,
                        scope: SequenceScope.SCHOOL
                    },
                },
                update: {
                    lastNumber: finalReceiptNo,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PAYMENT,
                    scope: SequenceScope.SCHOOL,
                    lastNumber: finalReceiptNo,
                },
            });

        } else {
            finalReceiptNo = (seq?.lastNumber ?? 0) + 1;

            await tx.documentSequence.upsert({
                where: {
                    academicYearId_type_scope: {
                        academicYearId: academicYear.id,
                        type: DocumentKind.PAYMENT,
                        scope: SequenceScope.SCHOOL
                    },
                },
                update: {
                    lastNumber: finalReceiptNo,
                },
                create: {
                    academicYearId: academicYear.id,
                    type: DocumentKind.PAYMENT,
                    scope: SequenceScope.SCHOOL,
                    lastNumber: finalReceiptNo
                },
            });
        }


        /* 4. CREATE PAYMENT */
        return tx.payment.create({
            data: {
                academicYearId: academicYear.id,
                flowGroupId: flowGroup.id,
                receiptNo: finalReceiptNo,
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
        paymentId: result.id,
        receiptNo: result.receiptNo,
    });
}))

router.post('/company/:companyId', asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;

    const {
        data,
        error
    } = paymentCompanySchema.safeParse(req.body);

    if (error) throw new AppError('Validation Failed', 409)

    const {
        amount,
        mode,
        referenceNo,
        note,
        recordedByUserId,
        paymentDate,
        paymentNo
    } = data

    const result = await prisma.$transaction(async (tx) => {

        /* 1. OPEN ACADEMIC YEAR */
        const academicYear = await tx.academicYear.findFirst({
            where: { status: "OPEN" },
        });

        if (!academicYear) throw new AppError("No open academic year", 404);

        /* 2. FLOW GROUP */
        let flowGroup = await tx.flowGroup.findFirst({
            where: {
                companyId,
                schoolId: null,
                academicYearId: academicYear.id,
                status: "OPEN",
            },
        });

        if (!flowGroup) {
            flowGroup = await tx.flowGroup.create({
                data: {
                    companyId,
                    academicYearId: academicYear.id,
                    status: "OPEN",
                },
            });
        }

        /* 3. CREATE PAYMENT */
        return tx.payment.create({
            data: {
                academicYearId: academicYear.id,
                flowGroupId: flowGroup.id,
                receiptNo: paymentNo,
                amount,
                mode,
                note:
                    mode === "BANK" && referenceNo
                        ? `Ref: ${referenceNo}`
                        : note ?? null,
                recordedByUserId,
                createdAt: new Date(paymentDate)
            },
        });
    });

    return res.json({
        success: true,
        paymentId: result.id,
        receiptNo: result.receiptNo,
    });
}))

router.get("/school/receipt/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw new AppError('Receipt id required', 400)

    /* ===============================
       1. FETCH PAYMENT
    =============================== */

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            flowGroup: {
                include: {
                    school: {
                        select: {
                            name: true,
                            phone: true,
                            email: true,
                            town: true,
                            district: true,
                            state: true,
                            pincode: true,
                            contactPerson: true,
                            street: true,
                            gst: true,
                        },
                    },
                },
            },
            recordedByUser: {
                select: { name: true },
            },
            reversedByUser: {
                select: { name: true }
            }
        },
    });

    if (!payment) throw new AppError('Receipt not found', 404)

    /* ===============================
       2. SCHOOL (PAYER)
    =============================== */

    const school = payment.flowGroup?.school;

    if (!school) throw new AppError('School information missing for this receipt', 400)

    /* ===============================
       3. RESPONSE
    =============================== */

    return res.json({
        receiptNo: payment.receiptNo,
        date: payment.createdAt,
        amount: Number(payment.amount),
        mode: payment.mode,
        note: payment.note,

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

        recordedBy:
            payment.recordedByUser?.name ?? "System",

        status: payment.status,
        reversedBy: payment.recordedByUser?.name ?? null,
        reversedAt: payment.reversedAt
    });

}))

router.get("/company/receipt/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) throw new AppError('Receipt id required', 400)

    /* ===============================
       1. FETCH PAYMENT
    =============================== */

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            flowGroup: {
                include: {
                    company: {
                        select: {
                            name: true,
                            phone: true,
                            gst: true,
                            email: true,
                            town: true,
                            district: true,
                            state: true,
                            pincode: true,
                        },
                    },
                },
            },
            recordedByUser: {
                select: { name: true },
            },
        },
    });

    if (!payment) throw new AppError('Receipt not found', 404)

    /* ===============================
       2. COMPANY (PAYER)
    =============================== */

    const company = payment.flowGroup?.company;

    if (!company) throw new AppError('Company information missing for this receipt', 400)

    /* ===============================
       4. RESPONSE
    =============================== */

    return res.json({
        receiptNo: payment.receiptNo,
        date: payment.createdAt,
        amount: Number(payment.amount),
        mode: payment.mode,
        note: payment.note,

        company: {
            name: company.name,
            phone: company.phone ?? "",
            gst: company.gst ?? "",
            address: [
                company.town,
                company.district,
                company.state,
                company.pincode,
            ]
                .filter(Boolean)
                .join(", "),
        },

        recordedBy: payment.recordedByUser?.name ?? "System",

        status: payment.status,
        reversedBy: payment.recordedByUser?.name ?? null,
        reversedAt: payment.reversedAt
    });

}))


router.post('/reverse/:id', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id
    const userId = req.user?.userId

    if (!paymentId || !userId) throw new AppError('InvoiceId or UserId is required', 401)

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            academicYear: true,
            flowGroup: true,
        },
    })

    if (!payment) throw new AppError('Payment not found', 404)

    if (payment.status === PaymentStatus.REVERSED) throw new AppError('Payment already reversed', 400)

    // 🔒 academic year lock
    if (payment.academicYear.status !== AcademicYearStatus.OPEN) throw new AppError('Academic year is closed. Cannot reverse payment.', 403)

    // 🔒 flow group lock (if linked)
    if (payment.flowGroup && payment.flowGroup.status !== FlowStatus.OPEN) {
        throw new AppError('Flow group is closed. Cannot reverse payment.', 403)
    }

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
            status: PaymentStatus.REVERSED,
            reversedAt: new Date(),
            reversedByUserId: userId,
        },
    })

    if (!updatedPayment) throw new AppError("Unable to reverse the payment", 500)

    return res.json({ message: "Payment reversed successfully" })

}))

export default router;
