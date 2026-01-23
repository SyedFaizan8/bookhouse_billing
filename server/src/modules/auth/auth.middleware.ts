import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../env.js";

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

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
        return res.sendStatus(401);
    }
}
