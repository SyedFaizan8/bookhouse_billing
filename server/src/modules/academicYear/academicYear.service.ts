import { prisma } from "../../lib/prisma.js";

export async function listAcademicYears() {
    return prisma.academicYear.findMany({
        orderBy: { startDate: "desc" },
    })
}

export async function createAcademicYear(start: Date, end: Date) {
    if (start >= end) {
        throw new Error("Start date must be before end date")
    }

    const overlap = await prisma.academicYear.findFirst({
        where: {
            OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
        },
    })

    if (overlap) {
        throw new Error("Academic year overlaps with existing year")
    }

    return prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({
            where: { status: "OPEN" },
            data: { status: "CLOSED", closedAt: new Date() },
        })

        return tx.academicYear.create({
            data: {
                name: `${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`,
                startDate: start,
                endDate: end,
                status: "OPEN",
            },
        })
    })
}

export async function closeAcademicYear(id: string) {
    const year = await prisma.academicYear.findUnique({ where: { id } })
    if (!year) throw new Error("Academic year not found")
    if (year.status === "CLOSED") return year

    return prisma.academicYear.update({
        where: { id },
        data: { status: "CLOSED", closedAt: new Date() },
    })
}
