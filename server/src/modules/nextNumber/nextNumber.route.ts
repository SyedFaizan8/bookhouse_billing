import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../prisma.js";
import { DocumentKind } from "../../generated/prisma/enums.js";
import { AppError } from "../../utils/error.js";
import { asyncHandler } from "../../utils/async.js";

const router = Router();

/* ============================================
   MAP URL → DOCUMENT TYPE
============================================ */

const typeMap: Record<string, DocumentKind> = {
    estimation: DocumentKind.ESTIMATION,
    invoice: DocumentKind.INVOICE,
    payment: DocumentKind.PAYMENT,
    credit: DocumentKind.CREDIT_NOTE,
};

/* ============================================
   GET NEXT DOCUMENT NUMBER (PREVIEW ONLY)
============================================ */

router.get("/:type", asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.params;

    const documentType = typeMap[type];

    if (!documentType) throw new AppError('Invalid document type', 400)
    /* ---------------------------------------
       1. OPEN ACADEMIC YEAR
    --------------------------------------- */

    const academicYear = await prisma.academicYear.findFirst({
        where: { status: "OPEN" },
        select: { id: true },
    });

    if (!academicYear) throw new AppError('No open academic year', 400)

    /* ---------------------------------------
       2. FETCH CURRENT SEQUENCE
    --------------------------------------- */

    const sequence = await prisma.documentSequence.findUnique({
        where: {
            academicYearId_type: {
                academicYearId: academicYear.id,
                type: documentType,
            },
        },
        select: {
            lastNumber: true,
        },
    });

    /* ---------------------------------------
       3. CALCULATE NEXT NUMBER
    --------------------------------------- */

    const nextNumber = (sequence?.lastNumber ?? 0) + 1;

    /* ---------------------------------------
       4. RESPONSE (PREVIEW ONLY)
    --------------------------------------- */

    return res.json({
        type: documentType,
        nextNumber,
    });
}))

export default router;
