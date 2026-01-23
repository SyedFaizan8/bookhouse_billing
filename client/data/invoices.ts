import { Invoice } from "@/types/invoice"

export const invoicesData: Invoice[] = [
    {
        id: "1",
        invoiceNo: "INV-1001",
        customerId: "c1",
        customerName: "Sri Vidya School",

        invoiceDate: "2024-03-01",
        dueDate: "2024-03-15",

        status: "DRAFT",

        items: [
            {
                id: "i1",
                textbookId: "t1",
                name: "Mathematics – Class 6",
                qty: 50,
                price: 120,
                total: 6000,
            },
        ],

        subTotal: 6000,
        totalAmount: 6000,
        amountPaid: 0,
        amountDue: 6000,
    },

    {
        id: "2",
        invoiceNo: "INV-1002",
        customerId: "c2",
        customerName: "Green Valley High School",

        invoiceDate: "2024-02-20",
        dueDate: "2024-03-05",

        status: "SENT",

        items: [
            {
                id: "i2",
                textbookId: "t2",
                name: "Science – Class 7",
                qty: 40,
                price: 150,
                total: 6000,
            },
        ],

        subTotal: 6000,
        discountType: "PERCENT",
        discountValue: 5,
        discountAmount: 300,

        totalAmount: 5700,
        amountPaid: 0,
        amountDue: 5700,
    },

    {
        id: "3",
        invoiceNo: "INV-1003",
        customerId: "c3",
        customerName: "Oxford Public School",

        invoiceDate: "2024-01-10",
        dueDate: "2024-01-25",

        status: "DUE",

        items: [
            {
                id: "i3",
                textbookId: "t3",
                name: "English – Class 5",
                qty: 60,
                price: 90,
                total: 5400,
            },
        ],

        subTotal: 5400,

        taxes: [
            {
                name: "GST",
                percent: 5,
                amount: 270,
            },
        ],

        totalAmount: 5670,
        amountPaid: 2000,
        amountDue: 3670,
    },

    {
        id: "4",
        invoiceNo: "INV-1004",
        customerId: "c4",
        customerName: "St. Mary’s School",

        invoiceDate: "2023-12-05",
        dueDate: "2023-12-20",

        status: "PAID",

        items: [
            {
                id: "i4",
                textbookId: "t4",
                name: "Social Science – Class 8",
                qty: 45,
                price: 140,
                total: 6300,
            },
        ],

        subTotal: 6300,

        totalAmount: 6300,
        amountPaid: 6300,
        amountDue: 0,

        note: "Paid via bank transfer",
    },
]
