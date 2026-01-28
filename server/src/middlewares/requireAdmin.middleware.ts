import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.js";

export function requireAdmin(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (!req.user) throw new AppError('Not authenticated', 401)

    if (req.user.role !== "ADMIN") throw new AppError('Admin access only', 403)

    next();
}
