import { z } from "zod"

export const dealerSchema = z.object({
    name: z.string().min(2, "Dealer name is required"),
    phone: z
        .string()
        .min(10, "Phone must be at least 10 digits")
        .regex(/^\d+$/, "Phone must contain only numbers"),

    email: z.email("Invalid email").optional().or(z.literal("")),

    street: z.string().min(2, "Street is required"),
    town: z.string().optional(),
    district: z.string().min(2, "District is required"),
    state: z.string().min(2, "State is required"),
    pincode: z
        .string()
        .min(6, "Pincode must be 6 digits")
        .regex(/^\d+$/, "Invalid pincode"),

    gst: z.string().optional(),
    bankName: z.string().optional(),
    accountNo: z.string().optional(),
    ifsc: z.string().optional(),
})

export type DealerFormValues = z.infer<typeof dealerSchema>
