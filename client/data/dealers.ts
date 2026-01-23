export type Dealer = {
    id: number
    name: string
    phone: string
    amountDue: number
    createdAt: string
}

export const dealersData: Dealer[] = [
    {
        id: 1,
        name: "Oxford Publications",
        phone: "9876543210",
        amountDue: 42000,
        createdAt: "2024-12-01",
    },
    {
        id: 2,
        name: "Pearson India",
        phone: "9123456789",
        amountDue: 0,
        createdAt: "2024-11-10",
    },
    {
        id: 3,
        name: "Navneet Publishers",
        phone: "9988776655",
        amountDue: 15800,
        createdAt: "2024-10-18",
    },
]
