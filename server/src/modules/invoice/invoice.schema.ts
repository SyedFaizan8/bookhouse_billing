import { z } from "zod"

export const CreateInvoiceDTO = z.object({
    customerId: z.uuid(),
    billedByUserId: z.uuid(),
    notes: z.string().optional(),

    items: z.array(
        z.object({
            textbookId: z.uuid(),
            quantity: z.number().int().min(1),
            unitPrice: z.number().min(0),
            discountType: z.enum(["PERCENT", "AMOUNT"]),
            discountValue: z.number().min(0),
        })
    ).min(1),
});

export type CustomerPayloadInvoice = z.output<typeof CreateInvoiceDTO>;