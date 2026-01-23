import { z } from "zod";

export const optionalField = (schema: z.ZodTypeAny) =>
    schema
        .or(z.literal(""))
        .transform(v => (v === "" ? undefined : v));

export const updateTextbookSchema = z.object({
    title: optionalField(
        z.string().min(2, "Title must be at least 2 characters")
    ),

    class: optionalField(
        z.string().min(1, "Class is required")
    ),

    subject: optionalField(
        z.string()
    ),

    medium: optionalField(
        z.string()
    ),

    editionYear: optionalField(
        z.coerce.number()
            .int("Edition year must be a number")
            .min(2000, "Invalid edition year")
            .max(new Date().getFullYear() + 1)
    ),

    mrp: optionalField(
        z.coerce.number()
            .positive("MRP must be greater than 0")
    )
});

export type UpdateTextbookInput = z.input<typeof updateTextbookSchema>;
