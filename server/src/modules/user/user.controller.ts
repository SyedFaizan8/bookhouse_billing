import { Request, Response } from "express";
import { userService } from "./user.service.js";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";

export const listUsers = async (_req: Request, res: Response) => {
    const users = await userService.list();
    res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await prisma.user.findUnique({
        where: { phone },
    });

    if (existing) {
        return res.status(409).json({
            message: "User already exists",
        });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            phone,
            password: hashed,
            role,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
        },
    });

    return res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
};

export const getUserProfileEdit = async (req: Request, res: Response) => {
    const data = await userService.getUserProfileEdit(req.params.id)

    if (!data) {
        return res.status(404).json({ message: "user not found" })
    }

    res.json(data)
}