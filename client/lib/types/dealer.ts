export type Company = {
    id: string
    name: string
    phone: string
    amountDue: number
    addedOn: string
    active: boolean
    deactivatedAt: string | null
}

export type DealerEditResponse = {
    id: string
    name: string
    phone: string
    email?: string
    street?: string
    town?: string
    district?: string
    state?: string
    pincode?: string
    gst?: string
    bankName?: string
    accountNo?: string
    ifsc?: string
    active: boolean
    deactivatedAt?: boolean
}

// dealer2
export type DealerProfile = {
    name: string,
    phone: string,
    email?: string,
    street?: string,
    town?: string,
    district?: string,
    state?: string,
    pincode?: string,
    gst?: string,
    bankName?: string,
    accountNo?: string,
    ifsc?: string,
    active: string,
    deactivatedAt?: string,
    createdAt: string,
    modifiedAt: string,
}
