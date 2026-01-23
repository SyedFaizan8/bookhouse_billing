import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export class UserService {
    // ✅ LIST USERS
    async list() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    // GET PROFILE TO EDIT
    async getUserProfileEdit(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                name: true,
                role: true,
                email: true,
                modifiedAt: true,
                createdAt: true
            },
        })

        if (!user) return null

        return user
    }

    // ✅ CREATE USER
    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                role: data.role,
                password: hashedPassword,
            },
        });
    }

    // ✅ UPDATE USER (password optional)
    async update(id: string, data: any) {
        const updateData: any = { ...data };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
        });
    }


}

export const userService = new UserService();
