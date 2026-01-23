import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route.js";
import customerRoutes from "./modules/customer/customer.route.js";
import dealerRoutes from "./modules/dealer/dealer.route.js";
import companyRoutes from "./modules/company/company.route.js";
import companyInfoRoutes from "./modules/settings/settings.route.js";
import academicYearRoutes from "./modules/academicYear/academicYear.route.js";
import dealer2Routes from "./modules/dealer2/dealer.route.js";
import customer2Routes from "./modules/customer2/customer.route.js";
import inventoryRoutes from "./modules/inventory/inventory.route.js";
import invoiceRoutes from "./modules/invoice/invoice.route.js";
import salesReturnsRoutes from "./modules/sale-returns/sale-returns.route.js";
import paymentsRoutes from "./modules/payments/payments.routes.js";
import { requireAuth } from "./modules/auth/auth.middleware";
import { requireAdmin } from "./modules/auth/requireAdmin.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/customers", requireAuth, customerRoutes);
router.use("/dealers", requireAuth, dealerRoutes);
router.use("/company", requireAuth, companyRoutes);
router.use("/users", requireAuth, userRoutes);
router.use("/company-info", requireAuth, companyInfoRoutes)
router.use("/academic-year", requireAuth, academicYearRoutes)
router.use("/dealer2", requireAuth, dealer2Routes) // change the name later
router.use("/customer2", requireAuth, customer2Routes) // change the name later
router.use("/inventory", requireAuth, inventoryRoutes)
router.use("/invoices", requireAuth, invoiceRoutes)
router.use("/sales-returns", requireAuth, salesReturnsRoutes)
router.use("/payments", requireAuth, paymentsRoutes)

export default router;
