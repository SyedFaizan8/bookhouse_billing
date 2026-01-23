export type School = {
    id: string
    name: string
    phone: string
    amountDue: number
    addedOn: string
}

export type CustomerEditResponse = {
    id: string
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
    board?: string
    medium?: string
    active: boolean
}

// customer2
export type CustomerProfile = {
    id: string,
    name: string,
    phone: string,
    email?: string,
    contactPerson?: string,
    street?: string,
    town?: string,
    district?: string,
    state?: string,
    pincode?: string,
    gst?: string,
    board?: string,
    medium?: string,
    active: Boolean,
    deactivatedAt?: string,
    createdAt: string,
    modifiedAt: string,
}

export type InvoiceRow = {
    id: string;
    invoiceNo: string;
    date: string;
    totalQty: number;
    amount: number;
    createdAt: string;
};

export type StatementRow = {
    date: string;
    type: "Invoice" | "Payment" | "Sales Return";
    ref: string;
    debit: number;
    credit: number;
    balance: number;
};

export type CustomerStatement = {
    rows: StatementRow[];
    company: {
        name: string;
        address: string;
        phone?: string;
        gst?: string;
    };
    customer: {
        name: string;
        phone?: string;
        gst?: string;
        address?: string;
    };
};