import { z } from "zod";

export const schoolCreateSchema = z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/),

    email: z.email().max(150).optional(),
    contactPerson: z.string().max(100).optional(),

    street: z.string().max(200).optional(),
    town: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().optional(),
    gst: z.string().optional(),
    board: z.string().max(50).optional(),
    medium: z.string().max(50).optional(),
});

export type SchoolCustomerDTO = z.infer<typeof schoolCreateSchema>;

export const paymentSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    mode: z.enum(["CASH", "UPI", "BANK", "CHEQUE"]),
    recordedByUserId: z.uuid(),
    referenceNo: z.string().nullish(),
    note: z.string().nullish(),
    receiptNo: z.string().nullish(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const paymentCompanySchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    mode: z.enum(["CASH", "UPI", "BANK", "CHEQUE"]),
    recordedByUserId: z.uuid(),
    referenceNo: z.string().nullish(),
    note: z.string().nullish(),
    paymentNo: z.string(),
    paymentDate: z.string()
});

export type PaymentCompanyFormValues = z.infer<typeof paymentCompanySchema>;
