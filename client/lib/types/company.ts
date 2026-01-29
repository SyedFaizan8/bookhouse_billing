export type Company = {
    id: string
    name: string
    phone: string
    addedOn: string
}


export type CompanyProfile = {
    name: string,
    phone: string,
    email?: string,
    street?: string,
    town?: string,
    district?: string,
    state?: string,
    pincode?: string,
    gst?: string,
    bankName?: string,
    accountNo?: string,
    ifsc?: string,
    active: string,
    deactivatedAt?: string,
    createdAt: string,
    modifiedAt: string,
}


export interface CompanyItemPayload {
    description: string;
    class?: string | null;
    company?: string | null;

    quantity: number;
    unitPrice: number;
    discountPercent: number;
}

export interface CreateCompanyInvoicePayload {
    companyId: string;
    recordedByUserId: string;
    notes?: string;
    supplierInvoiceNo: string;
    invoiceDate: string | Date;
    items: CompanyItemPayload[];
}


// Statement

export type CompanyStatement = {
    academicYear: string;

    company: {
        name: string
        phone: string
        email?: string

        street?: string
        town?: string
        district?: string
        state?: string
        pincode?: string

        gst?: string
    };

    supplier: {
        name: string;
        phone?: string;
        gst?: string;
        address?: string;
    };

    rows: {
        date: Date;
        type: string;
        refNo: string;
        debit: number;
        credit: number;
        balance: number;
    }[];

    closingBalance: number;
};
