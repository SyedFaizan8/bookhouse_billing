import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/error.js";

interface PrismaError extends Error {
    code?: string;
    meta?: {
        target?: string[];
    };
}

export const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {

    /* ---------------- ZOD VALIDATION ---------------- */
    if (err instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        err.issues.forEach(issue => {
            const field = issue.path.join(".");
            formattedErrors[field] = issue.message;
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors,
        });
    }

    /* ---------------- CUSTOM APP ERROR ---------------- */
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    /* ---------------- PRISMA UNIQUE ERROR ---------------- */
    const prismaErr = err as PrismaError;

    if (prismaErr.code === "P2002") {
        const field = prismaErr.meta?.target?.[0] || "field";

        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            errors: {
                [field]: `${field} already exists`,
            },
        });
    }

    /* ---------------- UNKNOWN ERROR ---------------- */
    console.error("🔥 ERROR:", err);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
