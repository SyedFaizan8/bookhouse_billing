import { Router } from "express"
import type { Request, Response } from "express"
import { prisma } from "../../prisma.js";
import { schoolCreateSchema } from "./school.schema.js";

const router = Router()

// GET LIST OF SCHOOLS
router.get("/", async (req: Request, res: Response) => {

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
        addedOn: "createdAt",
        amountDue: "createdAt",
    };

    const sortField = sortMap[String(sort)] || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const schools = await prisma.school.findMany({
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

})


// CREATE SCHOOL
router.post("/new", async (req: Request, res: Response) => {
    const data = schoolCreateSchema.parse(req.body);

    if (!data) res.status(400).json({ message: "Validation failed" })

    // ✅ optional duplicate check
    const existing = await prisma.school.findFirst({
        where: { phone: data.phone },
    });

    if (existing) {
        return res.status(409).json({
            message: "Customer with this phone already exists",
        });
    }

    const customer = await prisma.school.create({
        data,
    });

    return res.status(201).json(customer);
});

// GET SCHOOL PROFILE
router.get("/:id/profile", async (req: Request, res: Response) => {

    const schoolId = req.params.id

    const school = await prisma.school.findUnique({
        where: { id: schoolId }
    })

    if (!school) throw new Error("School not found")

    return res.json(school)
})

// GET CUSTOMER PROFILE FOR EDIT
router.get("/:id/edit", async (req: Request, res: Response) => {

    const schoolId = req.params.id;

    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            contactPerson: true,
            street: true,
            town: true,
            district: true,
            state: true,
            pincode: true,
            gst: true,
            board: true,
            medium: true,
            active: true,
        },
    });

    if (!school) {
        return res.status(404).json({
            message: "School not found",
        });
    }

    return res.json(school)
});

// UPDATE SCHOOL
router.put("/:id", async (req: Request, res: Response) => {

    const id = req.params.id;

    const payload = schoolCreateSchema.parse(req.body);

    const existing = await prisma.school.findUnique({
        where: { id },
    });

    if (!existing) {
        return res.status(404).json({
            message: "School not found",
        });
    }

    // 🔥 remove undefined values
    const cleanData = Object.fromEntries(
        Object.entries(payload).filter(
            ([_, v]) => v !== undefined
        )
    );

    const updated = await prisma.school.update({
        where: { id },
        data: cleanData,
    });

    return res.json(updated);
})

export default router
