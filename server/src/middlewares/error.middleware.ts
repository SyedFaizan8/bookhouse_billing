import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);
    res.status(500).json({ message: err.message });
};
