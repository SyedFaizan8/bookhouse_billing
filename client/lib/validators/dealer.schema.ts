import { z } from "zod";

export const optionalString = (schema: z.ZodString) =>
    schema.nullable().optional().or(z.literal(""));

export const companySchema = z.object({
    name: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name must not exceed 150 characters"),

    phone: z.string(),

    email: optionalString(z.string().email("Please enter a valid email address")),

    street: optionalString(z.string().max(200, "Street must not exceed 200 characters")),

    town: optionalString(z.string().max(100, "Town must not exceed 100 characters")),

    district: optionalString(z.string().max(100, "District must not exceed 100 characters")),

    state: optionalString(z.string().max(100, "State must not exceed 100 characters")),

    pincode: optionalString(z.string()),

    gst: optionalString(z.string()),

    bankName: optionalString(z.string().max(200, "Bank name must not exceed 200 characters")),

    accountNo: optionalString(z.string()),

    ifsc: optionalString(z.string()),
});



export type CompanyFormValues = z.infer<typeof companySchema>;
