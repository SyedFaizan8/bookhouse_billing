import { z } from "zod";

export const paymentSchema = z.object({
    amount: z
        .number("Amount is required")
        .positive("Amount must be greater than 0"),

    mode: z.enum(["CASH", "UPI", "BANK"]),

    referenceNo: z.string().optional().or(z.literal("")),

    note: z.string().optional().or(z.literal("")),

    receiptNo: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
