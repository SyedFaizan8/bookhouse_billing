import { z } from "zod"

export const invoiceSchema = z.object({
    customerId: z.uuid(),

    items: z.array(
        z.object({
            textbookId: z.uuid(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().positive(),
        })
    ).min(1),

    discount: z.object({
        name: z.string().optional(),
        valueType: z.enum(["FLAT", "PERCENT"]),
        value: z.number().min(0),
    }).optional(),

    tax: z.object({
        name: z.string().optional(),
        value: z.number().min(0),
    }).optional(),

    note: z.string().optional(),
})


export const CreateInvoiceDTO = z.object({
    customerId: z.uuid(),
    billedByUserId: z.uuid(),
    notes: z.string().optional(),

    items: z.array(
        z.object({
            quantity: z.number().int().min(1),
            unitPrice: z.number().min(0),
            discountValue: z.number().min(0),
        })
    ).min(1),
});

export type CustomerPayloadInvoice = z.output<typeof CreateInvoiceDTO>;