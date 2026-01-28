import { z } from "zod";

export const CreateInvoiceItemDTO = z.object({
    description: z.string().min(1),
    class: z.string().optional().nullable(),
    company: z.string().optional().nullable(),

    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),

    discountPercent: z.number().min(0).max(100),
});

export const CreateInvoiceDTO = z.object({
    schoolId: z.string().uuid(),
    billedByUserId: z.string().uuid(),

    notes: z.string().optional().nullable(),

    items: z.array(CreateInvoiceItemDTO).min(1),
});

export type CreateEstimationDTOType = z.infer<typeof CreateInvoiceDTO>;

export const CreateCompanyInvoiceDTO = z.object({
    companyId: z.uuid(),
    recordedByUserId: z.uuid(),

    supplierInvoiceNo: z
        .string()
        .trim()
        .min(1, "Company invoice number is required"),

    invoiceDate: z.string().min(1, "Invoice date is required"),

    notes: z.string().optional().nullable(),

    items: z.array(CreateInvoiceItemDTO).min(1),
});
