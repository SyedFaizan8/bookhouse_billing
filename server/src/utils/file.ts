import fs from "fs"
import path from "path"

export function deleteFileIfExists(fileUrl: string) {
    try {
        const filePath = path.join(
            process.cwd(),
            fileUrl.replace(/^\/+/, "")
        )

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    } catch (error) {
        console.error("Failed to delete file:", error)
    }
}
