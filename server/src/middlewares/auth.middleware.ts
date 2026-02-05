import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { AppError } from "../utils/error.js";
import { prisma } from "../prisma.js";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) throw new AppError("Unauthorized", 401);

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            role: "ADMIN" | "STAFF";
        };

        // ✅ DB check for active user
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                role: true,
                active: true,
            },
        });

        if (!user) throw new AppError("User not found", 401);

        if (!user.active) {
            res.clearCookie(env.COOKIE_NAME);
            res.status(409).json({ message: "User account deactivated" });
            return
        }

        req.user = {
            userId: user.id,
            role: user.role,
        };

        next();
    } catch (err) {
        if (err instanceof AppError) throw err;

        throw new AppError("Invalid or expired token", 401);
    }
}
