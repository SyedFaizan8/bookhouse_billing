export interface EstimationItemPayload {
    description: string;
    class?: string | null;
    company?: string | null;

    quantity: number;
    unitPrice: number;
    discountPercent: number;
}

export interface CreatePayload {
    schoolId: string;
    billedByUserId: string;
    notes?: string;
    documentNo?: string

    items: EstimationItemPayload[];
}

export interface CreateCompanyPayload {
    companyId: string;
    billedByUserId: string;
    notes?: string;

    items: EstimationItemPayload[];
}
