import { prisma } from "../../lib/prisma.js";

export class CompanyService {
    // ✅ UPDATE (or create if missing)
    async upsert(data: any) {
        const existing = await prisma.companyInfo.findFirst();

        if (!existing) {
            return prisma.companyInfo.create({ data });
        }

        return prisma.companyInfo.update({
            where: { id: existing.id },
            data,
        });
    }
}

export const companyService = new CompanyService();

export async function getCompanyInfo() {
    const company = await prisma.companyInfo.findFirst();

    if (!company) {
        throw new Error("Company information not configured");
    }

    return company
}