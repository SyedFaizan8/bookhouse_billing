export type TextbookSearchResult = {
    id: string;
    title: string;
    class: string;
    subject?: string | null;
    medium?: string | null;
    editionYear?: number | null;
    sellingPrice: number;
    mrp: number;
    dealerName: string;
    stock: number;
};


import { z } from "zod";

export const updateTextbookSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .optional(),

    class: z
        .string()
        .trim()
        .min(1, "Class is required")
        .optional(),

    subject: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    medium: z
        .string()
        .trim()
        .optional()
        .or(z.literal("")),

    editionYear: z
        .number()
        .int()
        .min(2000)
        .max(new Date().getFullYear() + 1)
        .optional(),

    mrp: z
        .number()
        .positive("MRP must be greater than 0")
        .optional(),
});
