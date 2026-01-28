import { Request, Response, Router } from "express";
import { prisma } from "../../prisma.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { CompanyInfoInput, companyInfoSchema } from "./settings.schema.js";
import { ZodError } from "zod";
import { deleteFileIfExists } from "../../utils/file.js";
import { requireAdmin } from "../../middlewares/requireAdmin.middleware.js";
import { asyncHandler } from "../../utils/async.js";
import { AppError } from "../../utils/error.js";

const router = Router();

// GET company info (single row)
router.get("/", asyncHandler(async (_req: Request, res: Response) => {
    const settings = await prisma.settings.findFirst()
    if (!settings) throw new AppError('First Update the settings', 409)
    res.json(settings)
}))

router.put("/", requireAdmin,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "qrCode", maxCount: 1 },
    ]),
    asyncHandler(async (req: Request, res: Response) => {
        try {
            /* ===============================
               1. VALIDATE BODY
            =============================== */

            const parsed = companyInfoSchema.parse({
                ...req.body,
                email: req.body.email || null,
                gst: req.body.gst || null,
                town: req.body.town || null,
                district: req.body.district || null,
                state: req.body.state || null,
                pincode: req.body.pincode || null,
                bankName: req.body.bankName || null,
                accountNo: req.body.accountNo || null,
                ifsc: req.body.ifsc || null,
                upi: req.body.upi || null,
                phoneSecondary: req.body.phoneSecondary || null,
                phoneTertiary: req.body.phoneTertiary || null,
            })

            /* ===============================
               2. FETCH EXISTING
            =============================== */

            const existing = await prisma.settings.findFirst()

            /* ===============================
               3. FILE HANDLING
            =============================== */

            const files = req.files as {
                logo?: Express.Multer.File[]
                qrCode?: Express.Multer.File[]
            }

            const data: CompanyInfoInput = { ...parsed }

            // ---- LOGO ----
            if (files?.logo?.[0]) {
                if (existing?.logoUrl) {
                    deleteFileIfExists(existing.logoUrl)
                }

                data.logoUrl = `/uploads/${files.logo[0].filename}`
            }

            // ---- QR CODE ----
            if (files?.qrCode?.[0]) {
                if (existing?.qrCodeUrl) {
                    deleteFileIfExists(existing.qrCodeUrl)
                }

                data.qrCodeUrl = `/uploads/${files.qrCode[0].filename}`
            }

            /* ===============================
               4. CREATE OR UPDATE
            =============================== */

            const result = existing
                ? await prisma.settings.update({
                    where: { id: existing.id },
                    data,
                })
                : await prisma.settings.create({
                    data,
                })

            return res.json(result)
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: error.flatten().fieldErrors,
                })
            }
            throw new AppError('Failed to update company info', 500)
        }
    })
)

export default router;
