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
    date: Date;
    amount: number;
    mode: "CASH" | "UPI" | "BANK";
    referenceNo?: string;


    company: {
        name: string;
        address: string;
        phone?: string;
        email?: string;
        gst?: string
    };

    customer: {
        name: string;
        phone?: string;
        gst?: string
    };

    recordedBy: string;

};

export type ReceiptNo = {
    receiptNo: string
    nextNumber: number
}