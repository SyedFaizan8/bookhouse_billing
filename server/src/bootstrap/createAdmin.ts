import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { env } from "../env.js";

export async function createInitialAdmin() {
    const adminExists = await prisma.user.findFirst({
        where: {
            role: "ADMIN",
        },
    });

    if (adminExists) {
        console.log("✅ Admin already exists");
        return;
    }

    const phone = env.FIRST_ADMIN_PHONE;
    const password = env.FIRST_ADMIN_PASSWORD;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name: env.FIRST_ADMIN_NAME,
            phone,
            email: env.FIRST_ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log("🚀 First admin created");
}
