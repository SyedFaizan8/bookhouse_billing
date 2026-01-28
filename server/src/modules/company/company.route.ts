import { Router } from "express";
import type { Response, Request, NextFunction } from "express";
import { prisma } from "../../prisma.js";
import { companySchema, companyUpdateSchema } from "./company.schema.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router()

// GET LIST OF COMPANIES
router.get("/", asyncHandler(async (req: Request, res: Response) => {

    const {
        cursor,
        limit = "50",
        sort = "addedOn",
        order = "desc",
        search = "",
    } = req.query;

    const take = Math.min(Number(limit) || 50, 100);

    // 🔒 map frontend → db
    const sortMap: Record<string, "name" | "createdAt"> = {
        name: "name",
        addedOn: "createdAt"
    };

    const sortField = sortMap[String(sort)] || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const schools = await prisma.company.findMany({
        take: take + 1,
        ...(cursor && {
            cursor: { id: cursor as string },
            skip: 1,
        }),
        where: {
            active: true,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search as string, mode: "insensitive", }, },
                        { phone: { contains: search as string, }, },
                    ],
                }
                : {}),
        },
        orderBy: {
            [sortField]: sortOrder,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            createdAt: true,
            flows: {
                select: {
                    invoice: {
                        select: {
                            kind: true,
                            netAmount: true
                        }
                    },
                    payments: {
                        select: { amount: true }
                    }
                },
            },
        },
    });

    const hasNextPage = schools.length > take;
    const items = schools.slice(0, take);

    res.json({
        items: items.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            addedOn: s.createdAt,
        })),
        nextCursor: hasNextPage
            ? items[items.length - 1].id
            : null,
    });

}))


// CREATE COMPANY
router.post("/new", validate(companySchema), asyncHandler(async (req: Request, res: Response) => {

    const payload = req.body
    /* -------------------------------------------
       DUPLICATE CHECKS
    -------------------------------------------- */

    const duplicate = await prisma.company.findFirst({
        where: {
            OR: [
                { phone: payload.phone },
                payload.email ? { email: payload.email } : undefined,
                payload.gst ? { gst: payload.gst } : undefined,
            ].filter(Boolean) as any,
        },
        select: {
            id: true,
            phone: true,
            email: true,
            gst: true,
        },
    });

    if (duplicate) {
        if (duplicate.phone === payload.phone) throw new AppError('Company with this phone already exists', 409)

        if (payload.email && duplicate.email === payload.email) throw new AppError('Company with this email already exists', 409)

        if (payload.gst && duplicate.gst === payload.gst) throw new AppError('Company with this GST already exists', 409)
    }

    /* -------------------------------------------
       CREATE COMPANY
    -------------------------------------------- */

    const company = await prisma.company.create({
        data: payload,
    });

    return res.status(201).json({ company });
}))

// GET COMPANY PROFILE
router.get("/profile/:id", asyncHandler(async (req: Request, res: Response) => {

    const { id } = req.params

    const company = await prisma.company.findUnique({
        where: { id }
    })

    if (!company) throw new AppError("Company not found", 404)

    return res.json(company)
}))

// UPDATE COMPANY
router.put("/:id", validate(companyUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data = req.body

    // 2️⃣ check company exists
    const existing = await prisma.company.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existing) {
        return res.status(404).json({
            message: "Company not found",
        });
    }

    // 3️⃣ update
    const updated = await prisma.company.update({
        where: { id },
        data,
    });

    // 4️⃣ response
    return res.json(updated);

})

export default router