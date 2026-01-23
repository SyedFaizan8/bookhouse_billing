import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { DocumentType } from "../../generated/prisma/enums";

export async function getReceiptPdf(req: Request, res: Response) {
    try {
        const { id } = req.params;

        /* -------------------------------
           1. FETCH PAYMENT
        -------------------------------- */
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                flowGroup: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                                phone: true,
                                gst: true,
                            },
                        },
                    },
                },
                recordedByUser: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!payment) {
            return res.status(404).json({
                message: "Receipt not found",
            });
        }

        /* -------------------------------
           2. FETCH COMPANY
        -------------------------------- */
        const company = await prisma.companyInfo.findFirst({
            select: {
                name: true,
                phone: true,
                email: true,
                gst: true,
                town: true,
                district: true,
                state: true,
                pincode: true,
            },
        });

        if (!company) {
            return res.status(400).json({
                message: "Company information not configured",
            });
        }

        /* -------------------------------
           3. RESPONSE MAPPING
        -------------------------------- */

        const customer = payment.flowGroup.customer;

        return res.json({
            receiptNo: payment.receiptNo,
            date: payment.createdAt,
            amount: Number(payment.amount),
            mode: payment.mode,
            referenceNo: payment.note,

            company: {
                name: company.name,
                address: [
                    company.town,
                    company.district,
                    company.state,
                    company.pincode,
                ]
                    .filter(Boolean)
                    .join(", "),
                phone: company.phone,
                email: company.email,
                gst: company.gst,
            },

            customer: customer
                ? {
                    name: customer.name,
                    phone: customer.phone,
                    gst: customer.gst,
                }
                : null,

            recordedBy: payment.recordedByUser?.name ?? "System",
        });
    } catch (error) {
        console.error("Receipt PDF error:", error);

        return res.status(500).json({
            message: "Failed to generate receipt PDF",
        });
    }
}


export async function getNextPaymentReceiptNumber(_req: Request, res: Response) {
    try {
        /* ---------------------------------------
           1. OPEN ACADEMIC YEAR
        --------------------------------------- */

        const academicYear = await prisma.academicYear.findFirst({
            where: { status: "OPEN" },
            select: { id: true },
        });

        if (!academicYear) {
            return res.status(400).json({
                message: "No open academic year",
            });
        }

        /* ---------------------------------------
           2. FETCH SEQUENCE (NO UPDATE)
        --------------------------------------- */

        const sequence = await prisma.documentSequence.findUnique({
            where: {
                academicYearId_type: {
                    academicYearId: academicYear.id,
                    type: DocumentType.PAYMENT,
                },
            },
            select: {
                lastNumber: true,
            },
        });

        /* ---------------------------------------
           3. CALCULATE NEXT NUMBER
        --------------------------------------- */

        const nextNumber = (sequence?.lastNumber ?? 0) + 1;

        const receiptNo = `RCPT- ${nextNumber}`;

        /* ---------------------------------------
           4. RETURN PREVIEW ONLY
        --------------------------------------- */

        return res.json({
            receiptNo,
            nextNumber,
        });

    } catch (error) {
        console.error("Payment receipt preview error:", error);

        return res.status(500).json({
            message: "Failed to get payment receipt number",
        });
    }
}