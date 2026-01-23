import { Router } from "express";
import {
    createCustomer,
    getAllCustomers,
    getCustomerProfile,
    getCustomerProfileEdit,
    toggleCustomerActive,
    updateCustomer
} from "./customer.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    createCustomerSchema,
    toggleCustomerActiveSchema,
    updateCustomerSchema
} from "./customer.schema.js";

const router = Router();

// GET ALL CUSTOMERS
router.get("/", getAllCustomers);

// CREATE CUSTOMER
router.post("/", validate(createCustomerSchema), createCustomer);

// GET CUSTOMER PROFILE
router.get("/:id/profile", getCustomerProfile);

// GET CUSTOMER TO EDIT
router.get("/:id/edit", getCustomerProfileEdit);

// UPDATE CUSTOMER
router.put("/:id", validate(updateCustomerSchema), updateCustomer);

// ACTIVATE / DEACTIVATE CUSTOMER
router.patch("/:id/active", validate(toggleCustomerActiveSchema), toggleCustomerActive);


export default router;
