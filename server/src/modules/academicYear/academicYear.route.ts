import { Router } from "express"
import {
    listAcademicYears,
    createAcademicYear,
    closeAcademicYear,
} from "./academicYear.service"

const router = Router()

router.get("/", async (_, res) => {
    res.json(await listAcademicYears())
})

router.post("/", async (req, res) => {
    const { startDate, endDate } = req.body
    const year = await createAcademicYear(new Date(startDate), new Date(endDate))
    res.status(201).json(year)
})

router.post("/:id/close", async (req, res) => {
    res.json(await closeAcademicYear(req.params.id))
})

export default router
