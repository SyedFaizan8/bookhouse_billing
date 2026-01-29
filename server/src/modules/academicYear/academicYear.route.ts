import { Router, Response, Request } from "express"
import { prisma } from "../../prisma.js"
import { academicYearSchema } from "./academicYear.schema.js"
import { asyncHandler } from "../../utils/async.js"
import { AppError } from "../../utils/error.js"
import { requireAdmin } from "../../middlewares/requireAdmin.middleware.js"

const router = Router()

router.get("/", asyncHandler(async (_: Request, res: Response) => {

    const academicYearsList = await prisma.academicYear.findMany({
        orderBy: { startDate: "desc" },
    })

    res.json(academicYearsList)

    // structure of API
    // [
    //     {
    //         "id": "ddaab787-5599-43aa-ac6b-197f7de63916",
    //         "name": "2025-26",
    //         "startDate": "2025-03-01T00:00:00.000Z",
    //         "endDate": "2026-02-28T00:00:00.000Z",
    //         "status": "OPEN",
    //         "createdAt": "2026-01-20T04:45:17.597Z",
    //         "closedAt": null
    //     },
    //     {
    //         "id": "ddaab787-5599-43aa-ac6b-197f7de63916",
    //         "name": "2025-26",
    //         "startDate": "2025-03-01T00:00:00.000Z",
    //         "endDate": "2026-02-28T00:00:00.000Z",
    //         "status": "OPEN",
    //         "createdAt": "2026-01-20T04:45:17.597Z",
    //         "closedAt": null
    //     }
    // ]

}))

router.post("/", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    // 1️⃣ Validate input
    const parsed = academicYearSchema.safeParse(req.body)

    if (parsed.error) {
        throw new AppError('Validation error', 400)
    }

    const { startDate, endDate } = parsed.data

    // 2️⃣ Logical validation
    if (startDate >= endDate) throw new AppError('Start date must be before end date', 400)

    // 3️⃣ Overlap check (correct & minimal)
    const overlappingYear = await prisma.academicYear.findFirst({
        where: {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
        select: { id: true },
    })

    if (overlappingYear) throw new AppError('Academic year overlaps with an existing year', 409)

    // 4️⃣ Transaction (atomic)
    const academicYear = await prisma.$transaction(async (tx) => {
        // close existing OPEN year
        await tx.academicYear.updateMany({
            where: { status: "OPEN" },
            data: {
                status: "CLOSED",
                closedAt: new Date(),
            },
        })

        await tx.flowGroup.updateMany({
            where: {
                status: "OPEN",
            },
            data: {
                status: "SETTLED",
            },
        })

        // create new year
        await tx.academicYear.create({
            data: {
                name: `${startDate.getFullYear()}-${String(
                    endDate.getFullYear()
                ).slice(-2)}`,
                startDate,
                endDate,
                status: "OPEN",
            },
        })

        return true
    })

    return res.status(201).json({ success: academicYear })
}))

router.post("/:id/close", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id

    const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Close academic year
        const year = await tx.academicYear.updateMany({
            where: {
                id,
                status: "OPEN",
            },
            data: {
                status: "CLOSED",
                closedAt: new Date(),
            },
        })

        if (year.count === 0) throw new AppError("Academic year not found or already closed", 409)


        // 2️⃣ Close all OPEN flow groups of this academic year
        await tx.flowGroup.updateMany({
            where: {
                academicYearId: id,
                status: "OPEN",
            },
            data: {
                status: "SETTLED",
            },
        })

        return true
    })

    res.json({ success: result })
})
)


router.post("/:id/open", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id

    const result = await prisma.$transaction(async (tx) => {

        // 1️⃣ Close all academic years
        await tx.academicYear.updateMany({
            where: {
                status: "OPEN",
            },
            data: {
                status: "CLOSED",
                closedAt: new Date(),
            },
        })

        // 2️⃣ Close all OPEN flow groups
        await tx.flowGroup.updateMany({
            where: {
                status: "OPEN",
            },
            data: {
                status: "SETTLED",
            },
        })

        // 3️⃣ Open selected academic year
        await tx.academicYear.update({
            where: { id },
            data: {
                status: "OPEN",
                closedAt: null,
            },
        })

        // 4️⃣ Open all flow groups of that academic year
        await tx.flowGroup.updateMany({
            where: {
                academicYearId: id,
            },
            data: {
                status: "OPEN",
            },
        })

        return true
    })

    res.json({ success: result })
}))

router.patch("/:id", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const parsed = academicYearSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError("Validation error", 400)

    const { startDate, endDate } = parsed.data

    if (startDate >= endDate) throw new AppError("Start date must be before end date", 400)


    const existing = await prisma.academicYear.findUnique({ where: { id } })

    if (!existing) throw new AppError("Academic year not found", 404)

    if (existing.status === 'CLOSED') throw new AppError('Academic year is closed please, Open the academic year then try again', 409)

    // 🔒 Overlap check (excluding current year)
    const overlapping = await prisma.academicYear.findFirst({
        where: {
            id: { not: id },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        },
        select: { id: true },
    })

    if (overlapping) {
        throw new AppError(
            "Updated academic year overlaps with an existing year",
            409
        )
    }

    await prisma.academicYear.update({
        where: { id },
        data: {
            startDate,
            endDate,
            name: `${startDate.getFullYear()}-${String(
                endDate.getFullYear()
            ).slice(-2)}`,
        },
    })

    res.json({ message: "successfully updated." })
}))

router.get("/single/:id", requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const academicYear = await prisma.academicYear.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
            createdAt: true,
            closedAt: true,
        },
    })

    if (!academicYear) {
        throw new AppError("Academic year not found", 404)
    }

    res.json(academicYear)
})
)

export default router
