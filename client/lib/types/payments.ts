export type PaymentRow = {
    id: string;
    receiptNo: string;
    amount: number;
    mode: "CASH" | "UPI" | "BANK";
    note?: string;
    date: string;
    status: "POSTED" | "REVERSED"
};

type ReceiptData = {
    receiptNo: string;
    date: string;
    amount: number;
    mode: string;
    note: string

    recordedBy: string,

    status?: "POSTED" | "REVERSED",
    reversedBy?: string,
    reversedAt?: string
}

type data = {
    name: string;
    phone: string;
    email?: string

    street?: string,
    town?: string,
    district?: string,
    state?: string,
    pincode?: string,

    gst?: string;
};

export type ReceiptPdfData = ReceiptData & { school: data }

export type CompanyReceiptPdfData = ReceiptData & { company: data }