import { z } from "zod";

export const customerCreateSchema = z.object({
    name: z.string().min(2).max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/),

    email: z.email().max(150).optional(),
    contactPerson: z.string().max(100).optional(),

    street: z.string().max(200).optional(),
    town: z.string().max(100).optional(),
    district: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),

    gst: z
        .string()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
        )
        .optional(),

    board: z.string().max(50).optional(),
    medium: z.string().max(50).optional(),
});

export type CreateCustomerDTO = z.infer<typeof customerCreateSchema>;

export const paymentSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    mode: z.enum(["CASH", "UPI", "BANK", "CHEQUE"]),
    recordedByUserId: z.uuid(),
    referenceNo: z.string().optional(),
    note: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
