import { z } from "zod"

export const companyInfoSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    phone: z.string().min(6, "Phone is required"),

    email: z.email("Invalid email").optional().or(z.literal("")),
    gst: z.string().optional(),

    town: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),

    bankName: z.string().optional(),
    accountNo: z.string().optional(),
    ifsc: z.string().optional(),
    upi: z.string().optional(),

    logoUrl: z.string().optional(),
    qrCodeUrl: z.string().optional()

})

export type CompanyInfoForm = z.infer<typeof companyInfoSchema>
