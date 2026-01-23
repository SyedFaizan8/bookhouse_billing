import { Request, Response } from "express";
import { customerService } from "./customer.service.js";

// GET CUSTOMER PROFILE FOR EDIT
export const getCustomerProfileEdit = async (req: Request, res: Response) => {
    const data = await customerService.getCustomerProfileEdit(req.params.id)

    if (!data) {
        return res.status(404).json({ message: "Customer not found" })
    }

    res.json(data)
}


// GET CUSTOMER
export const getCustomerProfile = async (
    req: Request,
    res: Response
) => {
    const data = await customerService.getCustomerProfile(req.params.id);

    if (!data) {
        return res.status(404).json({ message: "Customer not found" });
    }

    res.json(data);
};

// CREATE CUSTOMER
export const createCustomer = async (
    req: Request,
    res: Response
) => {
    const customer = await customerService.create(req.body);
    res.status(201).json(customer);
};

// GET ALL CUSTOMERS
export const getAllCustomers = async (
    req: Request,
    res: Response
) => {
    const { cursor, limit, sort, order } = req.query

    const data = await customerService.listPaginated({
        cursor: cursor as string | undefined,
        limit: Number(limit) || 500,
        sort: sort === "name" ? "name" : "createdAt",
        order: order === "asc" ? "asc" : "desc",
    })

    res.json(data)
};

// UPDATE CUSTOMER
export const updateCustomer = async (req: Request, res: Response) => {
    const customer = await customerService.update(req.params.id, req.body);
    res.json(customer);
};

// ACTIVATE / DEACTIVATE
export const toggleCustomerActive = async (req: Request, res: Response) => {
    const customer = await customerService.setActive(
        req.params.id,
        req.body.active
    );
    res.json(customer);
};