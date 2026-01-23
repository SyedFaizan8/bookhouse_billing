export type InvoicePdfData = {
    invoiceNo: string;
    date: string;

    company: {
        name: string;
        phone?: string;
        email?: string;
        gst?: string;
        address: string;
        bankName?: string;
        accountNo?: string;
        ifsc?: string;
        upi?: string;
        logoUrl?: string;
        qrCodeUrl?: string
    };

    customer: {
        name: string;
        address: string;
        phone?: string;
        gst?: string;
    };

    items: {
        title: string;
        qty: number;
        rate: number;
        discountPercent: number;
    }[];

    totals: {
        qty: number;
        gross: number;
        discount: number;
        final: number;
    };

    billedBy: string;
};

export type InvoiceNumber = {
    invoiceNo: string;
    nextNumber: number
}