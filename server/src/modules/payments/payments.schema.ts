import { z } from "zod";

export const createPaymentSchema = z.object({
    flowGroupId: z.uuid(),
    amount: z.number().positive(),
    mode: z.enum(["CASH", "UPI", "BANK"]),
    referenceNo: z.string().optional(),
    note: z.string().optional(),
});

export const updatePaymentSchema = z.object({
    amount: z.number().positive().optional(),
    mode: z.enum(["CASH", "BANK", "UPI", "CHEQUE"]).optional(),
    referenceNo: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    paymentDate: z.string().optional(),
    receiptNo: z.string().trim().min(1, "Receipt number required").optional()
});