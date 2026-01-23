import { prisma } from "../../lib/prisma";
import { Request, Response } from "express"
import { updateTextbookSchema } from "./inventory.schema";

export async function getInventory(_req: Request, res: Response) {
    try {
        const academicYear = await prisma.academicYear.findFirst({
            where: { status: "OPEN" },
            select: { id: true },
        });

        if (!academicYear) {
            return res.status(400).json({
                message: "No open academic year found",
            });
        }

        const stock = await prisma.stockLedger.groupBy({
            by: ["textbookId"],
            where: {
                academicYearId: academicYear.id,
            },
            _sum: {
                qtyChange: true,
            },
        });

        const stockMap = new Map(
            stock.map((s) => [
                s.textbookId,
                s._sum.qtyChange ?? 0,
            ])
        );

        const textbooks = await prisma.textbook.findMany({
            where: {
                active: true,
                isStockItem: true,
            },
            select: {
                id: true,
                title: true,
                class: true,
                sellingPrice: true,
                dealer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { title: "asc" },
        });

        const result = textbooks.map((t) => ({
            id: t.id,
            title: t.title,
            class: t.class,
            price: Number(t.sellingPrice),
            available: stockMap.get(t.id) ?? 0,
            dealer: t.dealer,
        }));

        return res.json(result);

    } catch (error) {
        console.error("Get textbooks error:", error);

        return res.status(500).json({
            message: "Failed to fetch inventory",
        });
    }
}

export async function getBook(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const textbook = await prisma.textbook.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                class: true,
                subject: true,
                medium: true,
                editionYear: true,
                mrp: true,
                active: true,
            },
        });

        if (!textbook) {
            return res.status(404).json({
                message: "Textbook not found",
            });
        }

        return res.json({
            ...textbook,
            mrp: Number(textbook.mrp),
        });

    } catch (error) {
        console.error("Get textbook error:", error);

        return res.status(500).json({
            message: "Failed to fetch textbook",
        });
    }
}

export async function putBook(req: Request, res: Response) {
    try {
        const id = req.params.id;

        // 1️⃣ validate
        const data = updateTextbookSchema.parse(req.body);

        // 2️⃣ update only provided fields
        await prisma.textbook.update({
            where: { id },
            data,
        });

        return res.json({ success: true });

    } catch (err: any) {
        return res.status(400).json({
            message: err.message,
        });
    }
}


export async function searchTextbooks(req: Request, res: Response) {
    const q = String(req.query.q || "").trim();

    if (q.length < 2) {
        return res.json([]);
    }

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
    });

    const textbooks = await prisma.textbook.findMany({
        where: {
            active: true,
            title: {
                contains: q,
                mode: "insensitive",
            },
        },
        take: 20,
        include: {
            dealer: {
                select: { name: true },
            },
            stockLedgers: {
                where: {
                    academicYearId: academicYear?.id,
                },
                select: {
                    qtyChange: true,
                },
            },
        },
        orderBy: { title: "asc" },
    });

    return res.json(
        textbooks.map((b) => ({
            id: b.id,
            title: b.title,
            class: b.class,
            subject: b.subject,
            medium: b.medium,
            editionYear: b.editionYear,
            sellingPrice: Number(b.sellingPrice),
            mrp: Number(b.mrp),
            dealerName: b.dealer.name,
            stock: b.stockLedgers.reduce(
                (s, l) => s + l.qtyChange,
                0
            ),
        }))
    );
}
