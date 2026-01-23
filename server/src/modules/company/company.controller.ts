import { Request, Response } from "express";
import { companyService } from "./company.service.js";

export const updateCompanyInfo = async (req: Request, res: Response) => {
    const company = await companyService.upsert(req.body);
    res.json(company);
};
