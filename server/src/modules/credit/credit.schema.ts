import { z } from "zod";

export const CreateCreditNoteItemDTO = z.object({
    description: z.string().min(1),
    class: z.string().optional().nullable(),
    company: z.string().optional().nullable(),

    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),

    discountPercent: z.number().min(0).max(100),
});

export const CreateCreditNoteDTO = z.object({
    schoolId: z.string().uuid(),
    billedByUserId: z.string().uuid(),

    notes: z.string().optional().nullable(),

    items: z.array(CreateCreditNoteItemDTO).min(1),
});

export type CreateCreditNoteDTOType = z.infer<typeof CreateCreditNoteDTO>;

export const CreateCompanyCreditNoteDTO = z.object({
    companyId: z.string().uuid(),
    billedByUserId: z.string().uuid(),

    notes: z.string().optional().nullable(),

    items: z.array(CreateCreditNoteItemDTO).min(1),
});