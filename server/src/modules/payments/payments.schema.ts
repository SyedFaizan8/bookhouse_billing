import { z } from "zod";

export const createPaymentSchema = z.object({
    flowGroupId: z.uuid(),
    amount: z.number().positive(),
    mode: z.enum(["CASH", "UPI", "BANK"]),
    referenceNo: z.string().optional(),
    note: z.string().optional(),
});
