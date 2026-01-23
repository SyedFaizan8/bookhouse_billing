import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../env.js";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    (() => {
        const adapter = new PrismaPg({
            connectionString: env.DATABASE_URL,
        });

        return new PrismaClient({ adapter });
    })();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
