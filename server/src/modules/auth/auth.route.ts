import { Router } from "express";
import { login, logout, me } from "./auth.service.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema } from "./auth.schema.js";
import { requireAuth } from "./auth.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

export default router;
