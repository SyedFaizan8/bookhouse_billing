export type InventoryRow = {
    id: string;
    title: string;
    class: string;
    price: number;
    available: number;
    dealer: {
        id: string;
        name: string;
    };
};

export type TextbookSearchResult = {
    id: string;
    title: string;
    class: string;
    subject?: string;
    medium?: string;
    editionYear?: number;
    mrp: number;
    stock: number;
    dealerName: string;
};
