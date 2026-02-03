import { Router } from "express";
import type { Request, Response } from "express";

import bcrypt from "bcryptjs";
import { prisma } from "../../prisma.js";
import { signToken } from "./auth.jwt.js";
import { env } from "../../env.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema } from "./auth.schema.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 1000,
};

// router.post("/login", validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
//     const { phone, password } = req.body
//     const user = await prisma.user.findUnique({
//         where: { phone },
//     });

//     if (!user) throw new AppError('User not exist', 404)

//     const ok = await bcrypt.compare(password, user.password)
//     if (!ok) throw new AppError('Invalid credentials', 404)

//     const token = signToken({
//         id: user.id,
//         role: user.role,
//     });

//     res.cookie(env.COOKIE_NAME, token, cookieOptions);
//     res.json({ message: "Logged in" });
// }));

router.post("/login", asyncHandler(async (req: Request, res: Response) => {
    console.log("BODY:", req.body);

    const { phone, password } = req.body;

    console.log("DB lookup");

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) { console.log("user not found"); throw new AppError('User not exist', 404) }

    console.log("USER:", user);

    const ok = await bcrypt.compare(password, user?.password);

    console.log("COMPARE OK");

    res.json({ ok: true });
}));



router.post("/logout", requireAuth, asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(env.COOKIE_NAME);
    res.json({ message: "Logged out" });
}))


router.get("/me", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) throw new AppError('Unauthorized', 401)

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
        },
    });

    if (!user) throw new AppError('User not found', 401)

    res.json(user);
}));

export default router;
