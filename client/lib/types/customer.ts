export type School = {
    id: string
    name: string
    phone: string
    addedOn: string
}

export type SchoolEditResponse = {
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
export type SchoolProfile = {
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
    documentNo: string;
    date: string;
    totalQty: number;
    amount: number;
    createdAt: string;
};
