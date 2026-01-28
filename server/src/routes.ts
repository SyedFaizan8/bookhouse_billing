import { Router } from "express";

import { requireAuth } from "./middlewares/auth.middleware.js";
import { requireAdmin } from "./middlewares/requireAdmin.middleware.js";

import authRoutes from "./modules/auth/auth.route.js";
import academicYearRoutes from "./modules/academicYear/academicYear.route.js";
import userRoutes from "./modules/user/user.route.js";
import settingsRoutes from "./modules/settings/settings.route.js";
import schoolRoutes from "./modules/school/school.route.js";
import estimationRoutes from "./modules/estimation/estimation.route.js";
import invoiceRoutes from "./modules/invoice/invoice.route.js";
import creditNoteRoutes from "./modules/credit/credit.route.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import statementRoutes from "./modules/statement/statement.route.js";
import companyRoutes from "./modules/company/company.route.js";
import dashboardRoutes from "./modules/dashboard/dashboard.route.js";
import nextNumberRoutes from "./modules/nextNumber/nextNumber.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/academic-year", requireAuth, academicYearRoutes)
router.use("/users", requireAuth, requireAdmin, userRoutes);
router.use("/settings", requireAuth, settingsRoutes)
router.use("/schools", requireAuth, schoolRoutes)
router.use("/estimation", requireAuth, estimationRoutes)
router.use("/invoice", requireAuth, invoiceRoutes)
router.use("/credit", requireAuth, creditNoteRoutes)
router.use("/payment", requireAuth, paymentRoutes)
router.use("/statement", requireAuth, statementRoutes)
router.use("/company", requireAuth, companyRoutes)
router.use("/dashboard", requireAuth, requireAdmin, dashboardRoutes)
router.use("/next-number", requireAuth, nextNumberRoutes)

export default router;
