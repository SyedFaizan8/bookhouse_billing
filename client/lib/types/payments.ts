export type PaymentRow = {
    id: string;
    receiptNo: string;
    amount: number;
    mode: "CASH" | "UPI" | "BANK";
    note?: string;
    date: string;
};

type ReceiptData = {
    receiptNo: string;
    date: string;
    amount: number;
    mode: string;
    note: string;
    referenceNo: string;
    recordedBy: string,
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

export interface UpdatePaymentInput {
    amount?: number;
    mode?: "CASH" | "UPI" | "BANK";
    referenceNo?: string | null;
    note?: string | null;
    receiptNo?: string;
    paymentDate?: string;
}
