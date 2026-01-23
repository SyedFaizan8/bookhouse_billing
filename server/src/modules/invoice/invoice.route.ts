import { Router } from "express";
import { createProvisionalInvoice, getInvoice, getNextInvoiceNumber } from "./invoice.controller";

const router = Router()

router.post("/provisional", createProvisionalInvoice);

router.get("/next-number", getNextInvoiceNumber);

router.get("/:id", getInvoice);

export default router
