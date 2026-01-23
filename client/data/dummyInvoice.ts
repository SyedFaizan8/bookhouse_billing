export const dummyInvoice = {
    invoiceNo: "INV-1001",
    invoiceDate: "2024-01-20",
    dueDate: "2024-02-05",

    company: {
        name: "Vinayaka Book House",
        phone: "9876543210",
        address: "MG Road, Bangalore, Karnataka - 560001",
        gst: "29ABCDE1234F1Z5",
    },

    customer: {
        name: "Sri Vidya School",
        phone: "9988776655",
        address:
            "Basaveshwar Nagar, Davanagere, Karnataka - 577004",
        gst: "29SCHOOL1234Z5",
    },

    items: [
        {
            name: "Mathematics – Class 10",
            qty: 50,
            price: 120,
        },
        {
            name: "Science – Class 9",
            qty: 40,
            price: 110,
        },
        {
            name: "English – Class 8",
            qty: 30,
            price: 95,
        },
    ],

    discountName: "Festival Discount",
    discount: 500,

    taxName: "GST (5%)",
    tax: 725,

    total: 11525,
}
