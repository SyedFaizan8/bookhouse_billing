import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        phone: z.string().min(10),
        email: z.email().optional(),
        role: z.enum(["ADMIN", "STAFF"]),
        password: z.string().min(6),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().min(10).optional(),
        email: z.string().optional(),
        role: z.enum(["ADMIN", "STAFF"]).optional(),
        password: z.string().min(6).optional(),
    }),
});
