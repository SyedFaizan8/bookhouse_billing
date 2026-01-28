import { z } from "zod";

export const CreateEstimationItemDTO = z.object({
    description: z.string().min(1),
    class: z.string().optional().nullable(),
    company: z.string().optional().nullable(),

    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),

    discountPercent: z.number().min(0).max(100),
});

export const CreateEstimationDTO = z.object({
    schoolId: z.string().uuid(),
    billedByUserId: z.string().uuid(),
    documentNo: z.string(),

    notes: z.string().optional().nullable(),

    items: z.array(CreateEstimationItemDTO).min(1),
});

export type CreateEstimationDTOType = z.infer<typeof CreateEstimationDTO>;
