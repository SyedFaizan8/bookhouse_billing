export type InvoicePdfData = {
    documentNo: string;
    date: string;

    school: {
        name: string
        phone: string
        email?: string
        contactPerson?: string

        street?: string
        town?: string
        district?: string
        state?: string
        pincode?: string

        gst?: string
    };

    items: Item[];

    totals: {
        totalQuantity: number;
        grossAmount: number;
        totalDiscount: number;
        netAmount: number;
    };

    billedBy: string;
    kind: DocumentKind
};


export type CompanyInvoicePdfData = {
    documentNo: string;
    date: string;

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

    items: Item[];

    totals: {
        totalQuantity: number;
        grossAmount: number;
        totalDiscount: number;
        netAmount: number;
    };

    billedBy: string;
    kind: DocumentKind
};


export type Item = {
    description: string;
    class: string;
    company: string;
    quantity: number;
    rate: number;
    discountPercent: number;
    discountAmount: number,
    grossAmount: number,
    netAmount: number
}

export type DocumentKind = ["INVOICE", "ESTIMATION", "CREDIT_NOTE"]