import { Router } from "express";
import {
    listDealersPaginated,
    createDealer,
    updateDealer,
    toggleDealerActive,
    createPurchase,
    payDealer,
    getDealerOutstanding,
    getDealerProfileEdit,
} from "./dealer.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    createDealerSchema,
    updateDealerSchema,
    createPurchaseSchema,
    dealerPaymentSchema,
} from "./dealer.schema.js";

const router = Router();

// GET ALL DEALERS
router.get("/", listDealersPaginated);

// CREATE DEALER
router.post("/", validate(createDealerSchema), createDealer);

// UPDATE DEALER
router.put("/:id", validate(updateDealerSchema), updateDealer);

// GET DEALER TO EDIT
router.get("/:id/edit", getDealerProfileEdit);

// purchases ---

// CREATE PURCHASE
router.post("/purchases", validate(createPurchaseSchema), createPurchase);
router.post(
    "/purchases/:id/payments",
    validate(dealerPaymentSchema),
    payDealer
);
router.get("/:id/outstanding", getDealerOutstanding);

export default router;
