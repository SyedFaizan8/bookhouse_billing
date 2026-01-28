import { z } from "zod"

export const companyInfoSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    phone: z.string().min(1, "Phone is required"),

    email: z.email().optional().nullable(),
    gst: z.string().optional().nullable(),

    town: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),

    bankName: z.string().optional().nullable(),
    accountNo: z.string().optional().nullable(),
    ifsc: z.string().optional().nullable(),
    upi: z.string().optional().nullable(),

    phoneSecondary: z.string().optional().nullable(),
    phoneTertiary: z.string().optional().nullable(),

    logoUrl: z.string().optional().nullable(),
    qrCodeUrl: z.string().optional().nullable()
})

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>
