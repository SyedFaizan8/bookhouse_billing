import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    createUserSchema,
    updateUserSchema,
} from "./user.schema.js";

import type { Request, Response } from "express";


import bcrypt from "bcryptjs";
import { prisma } from "../../prisma.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";

const router = Router();

// LIST USER
router.get("/", asyncHandler(async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany({
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

    if (!users) throw new AppError('Users not found', 404)

    res.json(users);
}))

// CREATE USER
router.post("/", asyncHandler(async (req: Request, res: Response) => {
    const { name, phone, password, role, email } = req.body;

    if (!name || !phone || !password || !role) throw new AppError('Missing fields', 400)

    const existing = await prisma.user.findUnique({
        where: { phone },
    });

    if (existing) throw new AppError('User already exists', 409)

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            phone,
            password: hashed,
            role,
            email,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            email: true,
            createdAt: true
        },
    });

    return res.status(201).json(user);
}))

// UPDATE USER
router.put("/:id", validate(updateUserSchema), asyncHandler(async (req: Request, res: Response) => {

    const { id } = req.params

    const data = { ...req.body }

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            email: true,
            createdAt: true,
            modifiedAt: true,
        },
    });

    if (!user) throw new AppError('Failed to update user', 409)

    res.json(user);
}))

// GET USER TO EDIT
router.get("/:id/edit", asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            email: true,
            createdAt: true,
            modifiedAt: true,
        },
    })

    if (!user) throw new AppError('user not found', 404)

    res.json(user)
}))

export default router;

