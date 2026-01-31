export type PartyType = "SCHOOL" | "COMPANY"

export type DocumentType =
    | "ALL"
    | "INVOICE"
    | "CREDIT_NOTE"
    | "PAYMENT"

export type DashboardDocument = {
    id: string
    docNo: string | number
    kind: "INVOICE" | "CREDIT_NOTE" | "PAYMENT"
    date: string
    amount: string
    status: string
    party: string
    partyId: string
    partyType: PartyType
}

export type DashboardResponse = {
    items: DashboardDocument[]
    nextCursor: string | null
}

export type DashboardPdfRow = {
    docNo: string | number
    kind: "INVOICE" | "CREDIT_NOTE" | "PAYMENT"
    date: string
    party: string
    amount: string
    status: string
}
