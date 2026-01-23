import multer, { FileFilterCallback } from "multer"
import path from "path"
import fs from "fs"
import { Request } from "express"

const uploadDir = path.join(process.cwd(), "uploads")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

export const upload = multer({
    storage: multer.diskStorage({
        destination: (_req: Request, _file, cb: (error: Error | null, destination: string) => void) => cb(null, uploadDir),
        filename: (_req: Request, file, cb: (error: Error | null, destination: string) => void) => {
            const ext = path.extname(file.originalname)
            cb(null, `logo-${Date.now()}${ext}`)
        },
    }),
    fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"))
        }
        cb(null, true)
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
})
