import { Request, Response, NextFunction } from "express";

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            message: "Admin access only",
        });
    }

    next();
}
