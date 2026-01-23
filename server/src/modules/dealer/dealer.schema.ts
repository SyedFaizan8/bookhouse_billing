import { z } from "zod";

export const createDealerSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.email().optional(),

        street: z.string().optional(),
        town: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),

        gst: z.string().optional(),
        bankName: z.string().optional(),
        accountNo: z.string().optional(),
        ifsc: z.string().optional(),
    }),
});

export const updateDealerSchema = z.object({
    body: createDealerSchema.shape.body.partial(),
});

export const createPurchaseSchema = z.object({
    body: z.object({
        dealerId: z.uuid(),
        invoiceNo: z.string(),
        items: z.array(
            z.object({
                textbookId: z.uuid(),
                quantity: z.coerce.number().int().positive(),
                purchasePrice: z.coerce.number().positive(),
            })
        ),
    }),
});

export const dealerPaymentSchema = z.object({
    body: z.object({
        amount: z.coerce.number().positive(),
        mode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
        referenceNo: z.string().optional(),
    }),
});
