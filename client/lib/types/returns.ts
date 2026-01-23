export type SalesReturnInvoiceItem = {
    textbookId: string;
    title: string;
    issuedQty: number;
    alreadyReturned: number;
    remainingQty: number;
};

export type SalesReturnInvoice = {
    id: string;
    invoiceNo: string;
    date: string;
    flowGroupId: string;
    items: SalesReturnInvoiceItem[];
};

export type CreateSalesReturnInput = {
    flowGroupId: string;
    provisionalInvoiceId: string;
    items: {
        textbookId: string;
        qtyReturned: number;
    }[];
};