import { z } from "zod"

export const userCreateSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Mobile must be at least 10 digits"),
    email: z
        .string()
        .transform((v) => (v === "" ? undefined : v))
        .optional()
        .refine(
            (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            { message: "Invalid email address" }
        ),
    role: z.enum(["ADMIN", "STAFF"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export const userUpdateSchema = userCreateSchema
    .omit({ password: true })
    .extend({
        password: z.string().optional(),
    })

export type UserFormValues = z.infer<typeof userCreateSchema>
