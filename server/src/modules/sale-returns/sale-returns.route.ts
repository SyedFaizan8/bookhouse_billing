import { Router } from "express"
import { createReturnInvoice } from "./sale-returns.service"

const router = Router()

router.post('/', createReturnInvoice)

export default router
