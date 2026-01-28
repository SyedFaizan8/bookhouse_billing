import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  COOKIE_NAME: z.string().default("auth_token"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FIRST_ADMIN_PHONE: z.string(),
  FIRST_ADMIN_PASSWORD: z.string(),
  FIRST_ADMIN_NAME: z.string(),
  FIRST_ADMIN_EMAIL: z.string(),
  CLIENT_URL: z.string()
});

export const env = envSchema.parse(process.env);
