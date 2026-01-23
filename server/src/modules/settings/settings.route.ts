import { Request, Response, Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { companyInfoSchema } from "./settings.schema.js";
import { ZodError } from "zod";
import { deleteFileIfExists } from "../../utils/file.js";

const router = Router();

// GET company info (single row)
router.get("/", async (_req: Request, res: Response) => {
    const company = await prisma.companyInfo.findFirst()
    res.json(company)
})

// PUT update (text + optional logo)
// router.put("/",
//     upload.fields([
//         { name: "logo", maxCount: 1 },
//         { name: "qrCode", maxCount: 1 },
//     ]),
//     async (req: Request, res: Response) => {
//         try {
//             const parsed = companyInfoSchema.parse({
//                 ...req.body,
//                 email: req.body.email || null,
//                 gst: req.body.gst || null,
//                 town: req.body.town || null,
//                 district: req.body.district || null,
//                 state: req.body.state || null,
//                 pincode: req.body.pincode || null,
//                 bankName: req.body.bankName || null,
//                 accountNo: req.body.accountNo || null,
//                 ifsc: req.body.ifsc || null,
//             })

//             const existing = await prisma.companyInfo.findFirst()

//             const data = { ...parsed }

//             // 🔥 DELETE OLD LOGO IF NEW ONE UPLOADED
//             if (req.file) {
//                 if (existing?.logoUrl) {
//                     deleteFileIfExists(existing.logoUrl)
//                 }

//                 data.logoUrl = `/uploads/${req.file.filename}`
//             }

//             const result = existing
//                 ? await prisma.companyInfo.update({
//                     where: { id: existing.id },
//                     data,
//                 })
//                 : await prisma.companyInfo.create({
//                     data: {
//                         ...data,
//                         logoUrl: req.file
//                             ? `/uploads/${req.file.filename}`
//                             : null,
//                     },
//                 })

//             res.json(result)
//         } catch (error) {
//             if (error instanceof ZodError) {
//                 return res.status(400).json({
//                     message: "Validation failed",
//                     errors: error.flatten().fieldErrors,
//                 })
//             }

//             res.status(500).json({
//                 message: "Failed to update company info",
//             })
//         }
//     }
// )

router.put(
    "/",
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "qrCode", maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
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
            })

            /* ===============================
               2. FETCH EXISTING
            =============================== */

            const existing = await prisma.companyInfo.findFirst()

            /* ===============================
               3. FILE HANDLING
            =============================== */

            const files = req.files as {
                logo?: Express.Multer.File[]
                qrCode?: Express.Multer.File[]
            }

            const data: any = { ...parsed }

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
                ? await prisma.companyInfo.update({
                    where: { id: existing.id },
                    data,
                })
                : await prisma.companyInfo.create({
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

            console.error("Company info update error:", error)

            return res.status(500).json({
                message: "Failed to update company info",
            })
        }
    }
)

export default router;
