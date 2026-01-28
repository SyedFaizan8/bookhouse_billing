import { z } from "zod"

export const academicYearSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
})