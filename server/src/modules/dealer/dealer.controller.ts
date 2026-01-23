import { Request, Response } from "express";
import { dealerService } from "./dealer.service.js";

export const listDealersPaginated = async (req: Request, res: Response) => {
    const {
        cursor,
        limit = "50",
        sort = "addedOn",
        order = "desc",
    } = req.query

    const data = await dealerService.listPaginated({
        cursor: cursor as string | undefined,
        limit: Number(limit),
        sortBy: sort as "name" | "addedOn" | "amountDue",
        order: order === "asc" ? "asc" : "desc",
    })

    res.json(data)
}

export const createDealer = async (req: Request, res: Response) => {
    const dealer = await dealerService.create(req.body);
    res.status(201).json(dealer);
};

// GET CUSTOMER PROFILE
export const getDealerProfileEdit = async (req: Request, res: Response) => {
    const data = await dealerService.getDealerProfileEdit(req.params.id)

    if (!data) {
        return res.status(404).json({ message: "Customer not found" })
    }

    res.json(data)
}


export const updateDealer = async (req: Request, res: Response) => {
    const dealer = await dealerService.update(req.params.id, req.body);
    res.json(dealer);
};

export const toggleDealerActive = async (req: Request, res: Response) => {
    const dealer = await dealerService.setActive(
        req.params.id,
        req.body.active
    );
    res.json(dealer);
};

// purchase
export const createPurchase = async (req: Request, res: Response) => {
    const invoice = await dealerService.createPurchase(req.body);
    res.status(201).json(invoice);
};

export const payDealer = async (req: Request, res: Response) => {
    const result = await dealerService.payDealer(req.params.id, req.body);
    res.json(result);
};

export const getDealerOutstanding = async (req: Request, res: Response) => {
    const data = await dealerService.getOutstanding(req.params.id);
    res.json(data);
};
