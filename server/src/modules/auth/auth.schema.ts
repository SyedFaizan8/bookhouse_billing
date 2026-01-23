import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        phone: z.string().length(10),
        password: z.string(),
    }),
});