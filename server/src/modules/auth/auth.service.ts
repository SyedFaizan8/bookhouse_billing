import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { signToken } from "./auth.jwt.js";
import { Request, Response } from "express";
import { env } from "../../env.js";

const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 12 * 30 * 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response) {
    console.log('logging here')

    const { phone, password } = req.body

    const user = await prisma.user.findUnique({
        where: { phone },
    });

    if (!user) return res.status(404).json({ message: "User not exist" })


    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(404).json({ message: "Invalid credentials" })

    const token = signToken(user);

    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.json({ message: "Logged in" });
}

export const logout = (_req: Request, res: Response) => {
    res.clearCookie(env.COOKIE_NAME);
    res.json({ message: "Logged out" });
};


export async function me(req: Request, res: Response) {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
        },
    });

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
}
