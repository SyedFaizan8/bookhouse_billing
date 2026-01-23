import { Router } from "express"
import {
    createDealerPayment,
    createDealerReturn,
    createDealerSupply,
    getDealerProfile,
    getDealerStatement
} from "./dealer.service.js"
import { DealerPaymentSchema, DealerReturnSchema, DealerSupplySchema } from "./dealer.schema.js"

const router = Router()

router.get("/:id/profile", async (req, res) => {
    const data = await getDealerProfile(req.params.id)
    res.json(data)
})

router.post("/:dealerId/supplies", async (req, res) => {
    try {
        const dealerId = req.params.dealerId;
        const parsed = DealerSupplySchema.parse(req.body);

        const result = await createDealerSupply({
            dealerId,
            ...parsed,
        });

        res.status(201).json(result);
    } catch (e: any) {
        console.log(e)
        res.status(400).json({
            message: e.message ?? "Invalid request",
        });
    }
});

router.post("/:dealerId/returns", async (req, res) => {
    try {
        const parsed = DealerReturnSchema.parse(req.body);
        const result = await createDealerReturn({
            dealerId: req.params.dealerId,
            ...parsed,
        });

        res.status(201).json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});

router.post("/:dealerId/payments", async (req, res) => {
    try {
        const parsed = DealerPaymentSchema.parse(req.body);

        const result = await createDealerPayment({
            dealerId: req.params.dealerId,
            userId: "SYSTEM", // auth middleware
            ...parsed,
        });

        res.status(201).json(result);
    } catch (e: any) {
        console.log(e)
        res.status(400).json({ message: e.message });
    }
});

router.get("/:dealerId/statement", async (req, res) => {
    try {
        const data = await getDealerStatement(req.params.dealerId);
        res.json(data);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
});


export default router
