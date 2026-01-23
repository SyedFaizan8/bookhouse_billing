export type CompanySettings = {
    name: string
    phone: string
    email?: string
    gst?: string

    town?: string
    district?: string
    state?: string
    pincode?: string

    bankName?: string
    accountNo?: string
    ifsc?: string
    upi?: string

    logo?: File | null
    logoUrl?: string
    qrCodeUrl?: string
}
