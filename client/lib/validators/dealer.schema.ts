import { z } from "zod";

export const optionalString = (schema: z.ZodString) =>
    schema.nullable().optional().or(z.literal(""));

export const companySchema = z.object({
    name: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name must not exceed 150 characters"),

    phone: z
        .string()
        .regex(
            /^[6-9]\d{9}$/,
            "Phone number must be a valid 10-digit Indian mobile number"
        ),

    email: optionalString(z.string().email("Please enter a valid email address")),

    street: optionalString(z.string().max(200, "Street must not exceed 200 characters")),

    town: optionalString(z.string().max(100, "Town must not exceed 100 characters")),

    district: optionalString(z.string().max(100, "District must not exceed 100 characters")),

    state: optionalString(z.string().max(100, "State must not exceed 100 characters")),

    pincode: optionalString(z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits")),

    gst: optionalString(
        z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Invalid GST number format")
    ),

    bankName: optionalString(
        z.string().max(200, "Bank name must not exceed 200 characters")
    ),

    accountNo: optionalString(
        z.string().regex(/^\d{6,20}$/, "Account number must be between 6 and 20 digits")
    ),

    ifsc: optionalString(
        z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
    ),
});



export type CompanyFormValues = z.infer<typeof companySchema>;
