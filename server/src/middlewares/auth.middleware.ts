import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { AppError } from "../utils/error.js";

export function requireAuth(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) throw new AppError("Unauthorized", 401);

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            role: "ADMIN" | "STAFF";
        };

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }
}
