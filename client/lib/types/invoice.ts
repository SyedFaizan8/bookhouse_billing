export type PdfData = {
    documentNo: string;
    date: string;

    items: Item[];

    totals: {
        totalQuantity: number;
        grossAmount: number;
        totalDiscount: number;
        netAmount: number;
    };

    billedBy: string;
    kind: DocumentKind


    status: "ISSUED" | "VOIDED"
    voidedBy?: string;
    voidedAt?: string
};

type Information = {
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

export type InvoicePdfData = PdfData & { school: Information & { contactPerson?: string } }

export type CompanyInvoicePdfData = PdfData & { company: Information }
