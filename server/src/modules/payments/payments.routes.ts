import { Router } from "express";
import { getNextPaymentReceiptNumber, getReceiptPdf } from "./payments.service";

const router = Router();

router.get("/next-receipt-number", getNextPaymentReceiptNumber)

router.get("/:id/receipt", getReceiptPdf);


export default router;
