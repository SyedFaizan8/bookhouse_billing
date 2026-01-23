export type InvoiceItem = {
    id: string
    textbookId: string
    name: string
    qty: number
    price: number
    total: number
}

export type InvoiceTax = {
    name: string
    percent: number
    amount: number
}

export type Invoice = {
    id: string
    invoiceNo: string
    customerId: string
    customerName: string

    invoiceDate: string
    dueDate: string

    status: InvoiceStatus

    items: InvoiceItem[]

    subTotal: number
    discountType?: "PERCENT" | "AMOUNT"
    discountValue?: number
    discountAmount?: number

    taxes?: InvoiceTax[]
    totalAmount: number
    amountPaid: number
    amountDue: number

    note?: string
}
export type InvoiceStatus =
    | "DRAFT"
    | "SENT"
    | "DUE"
    | "PAID"
