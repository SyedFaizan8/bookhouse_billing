export type PaymentRow = {
    id: string;
    receiptNo: string;
    amount: number;
    mode: "CASH" | "UPI" | "BANK";
    note?: string;
    date: string;
};

export type ReceiptPdfData = {
    receiptNo: string;
    date: string;
    amount: number;
    mode: string;
    note: string

    school: {
        name: string;
        phone: string;
        email?: string
        gst?: string;
        street?: string,
        town?: string,
        district?: string,
        state?: string,
        pincode?: string,
    };

    recordedBy: string;
};

export type CompanyReceiptPdfData = {
    receiptNo: string;
    date: string;
    amount: number;
    mode: string;
    note: string

    company: company

    recordedBy: string;
};

export type company = {
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