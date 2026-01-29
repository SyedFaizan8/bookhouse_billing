import { z } from "zod";

export const companySchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Company name is required")
            .max(150, "Company name too long"),

        phone: z.string(),

        email: z
            .email("Invalid email address")
            .optional()
            .or(z.literal("")),

        street: z.string().optional().or(z.literal("")),
        town: z.string().optional().or(z.literal("")),
        district: z.string().optional().or(z.literal("")),
        state: z.string().optional().or(z.literal("")),
        pincode: z.string().optional().or(z.literal("")),

        gst: z.string().optional().or(z.literal("")),

        bankName: z.string().optional().or(z.literal("")),
        accountNo: z.string().optional().or(z.literal("")),

        ifsc: z.string().optional().or(z.literal("")),

        active: z.boolean().optional(),
    })
});


export type CompanyPayload = z.infer<typeof companySchema>;



const nullableString = (schema: z.ZodString) =>
    schema
        .nullable()
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" || v === null ? null : v));

export const companyUpdateSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, "Company name is required")
            .max(150, "Company name too long"),

        phone: z.string(),

        email: nullableString(
            z.string().email("Invalid email address").max(150)
        ),

        street: nullableString(z.string().max(200)),

        town: nullableString(z.string().max(100)),

        district: nullableString(z.string().max(100)),

        state: nullableString(z.string().max(100)),

        pincode: nullableString(z.string()),

        gst: nullableString(z.string()),

        bankName: nullableString(z.string().max(200)),

        accountNo: nullableString(z.string()),

        ifsc: nullableString(z.string()),
    })
});

export type CompanyFormValues = z.infer<typeof companyUpdateSchema>;