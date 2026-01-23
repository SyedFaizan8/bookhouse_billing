import { z } from "zod";

export const optionalField = (schema: z.ZodTypeAny) =>
    schema
        .or(z.literal(""))
        .transform(v => (v === "" ? undefined : v));


export const customerFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Customer name must be at least 2 characters")
        .max(100),

    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

    email: optionalField(
        z.email("Invalid email address").max(150)
    ),

    contactPerson: optionalField(z.string().trim().max(100)),

    street: optionalField(z.string().trim().max(200)),

    town: optionalField(z.string().trim().max(100)),

    district: optionalField(z.string().trim().max(100)),

    state: optionalField(z.string().trim().max(100)),

    pincode: optionalField(
        z.string().regex(/^\d{6}$/, "Pincode must be 6 digits")
    ),

    gst: optionalField(
        z.string().regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
        )
    ),

    board: optionalField(z.string().max(50)),

    medium: optionalField(z.string().max(50)),
});

export type CustomerFormValues = z.input<typeof customerFormSchema>;

export type CustomerPayload = z.output<typeof customerFormSchema>;
