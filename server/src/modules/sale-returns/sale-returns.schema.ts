import { z } from "zod"

export const CreateSalesReturnSchema = z.object({
    flowGroupId: z.string(),
    provisionalInvoiceId: z.string(),
    items: z.array(
        z.object({
            textbookId: z.uuid(),
            qtyReturned: z.number().int().positive(),
        })
    ).min(1),
});
