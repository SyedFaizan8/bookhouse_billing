import { z } from "zod";

export const createCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.email().optional(),
        contactPerson: z.string().optional(),

        street: z.string().optional(),
        town: z.string().optional(),
        district: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),

        gst: z.string().optional(),
        board: z.string().optional(),
        medium: z.string().optional(),
    }),
});

export const updateCustomerSchema = z.object({
    body: createCustomerSchema.shape.body.partial(),
});

export const toggleCustomerActiveSchema = z.object({
    body: z.object({
        active: z.boolean(),
    }),
});