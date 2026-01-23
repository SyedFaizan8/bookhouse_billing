export type Textbook = {
    id: string
    title: string
    publisher: string
    class: string
    subject: string
    medium: string
    edition: string
    mrp: number
    sellingPrice: number
    gstPercent: number
    stockQty: number
    isbn?: string
    hsnCode?: string
    status: "Active" | "Inactive"
    addedOn: string
}

export const textbooksData: Textbook[] = [
    {
        id: "4545",
        title: "Mathematics",
        publisher: "Oxford Publications",
        class: "5",
        subject: "Mathematics",
        medium: "English",
        edition: "2024–25",
        mrp: 350,
        sellingPrice: 330,
        gstPercent: 5,
        stockQty: 120,
        isbn: "9780190123456",
        hsnCode: "49019900",
        status: "Active",
        addedOn: "2024-12-10",
    },
]
