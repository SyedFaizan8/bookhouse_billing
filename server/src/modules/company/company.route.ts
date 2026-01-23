import { Router } from "express";
import {
    updateCompanyInfo,
} from "./company.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateCompanySchema } from "./company.schema.js";
import { getCompanyInfo } from "./company.service.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const data = await getCompanyInfo();
        res.json(data);
    } catch (e: any) {
        res.status(404).json({ message: e.message });
    }
});

router.put("/", validate(updateCompanySchema), updateCompanyInfo);

export default router;
