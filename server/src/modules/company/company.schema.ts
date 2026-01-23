import { z } from "zod";

export const updateCompanySchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.email().optional(),
        gst: z.string().optional(),

        town: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),

        bankName: z.string().optional(),
        accountNo: z.string().optional(),
        ifsc: z.string().optional(),
        upi: z.string().optional(),

        logoUrl: z.url().optional(),
    }),
});
