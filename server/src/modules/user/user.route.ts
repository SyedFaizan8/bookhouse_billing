import { Router } from "express";
import {
    listUsers,
    createUser,
    updateUser,
    getUserProfileEdit,
} from "./user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    createUserSchema,
    updateUserSchema,
} from "./user.schema.js";

const router = Router();

// LIST USER
router.get("/", listUsers);

// CREATE USER
router.post("/", createUser);

// UPDATE USER
router.put("/:id", validate(updateUserSchema), updateUser);

// GET CUSTOMER TO EDIT
router.get("/:id/edit", getUserProfileEdit);

export default router;
