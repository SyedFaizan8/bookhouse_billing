import { z } from "zod"

export const createAcademicYearSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
})