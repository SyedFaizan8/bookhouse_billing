import { z } from "zod";

// dealer supplies

export const DealerSupplyItemSchema = z.object({
    textbookId: z.uuid().optional(),

    title: z.string().min(1, "Textbook title is required"),
    class: z.string().min(1, "Class is required"),

    mrp: z.number().positive("MRP must be greater than 0"),
    qty: z.number().int().positive("Quantity must be at least 1"),
});

export const DealerSupplySchema = z.object({
    dealerInvoiceNo: z.string().min(1),
    invoiceDate: z.string(),
    recordedByUserId: z.string(),
    notes: z.string().optional(),
    items: z.array(DealerSupplyItemSchema).min(1),
});

export type DealerSupplyInput = z.infer<typeof DealerSupplySchema>;

// dealer return

export const DealerReturnItemSchema = z.object({
    textbookId: z.uuid(),
    qty: z.number().int().positive("Quantity must be > 0"),
});

export const DealerReturnSchema = z.object({
    date: z.coerce.date(),
    notes: z.string().optional(),
    items: z.array(DealerReturnItemSchema).min(1),
});

export type DealerReturnInput = z.infer<typeof DealerReturnSchema>;

// dealer payments

export const DealerPaymentSchema = z.object({
    date: z.coerce.date(),

    amount: z.number().positive("Amount must be greater than 0"),

    mode: z.enum(["CASH", "UPI", "BANK"]),

    note: z.string().optional(),

    recordedByUserId: z.string().optional()
});

export type DealerPaymentInput = z.infer<typeof DealerPaymentSchema>;