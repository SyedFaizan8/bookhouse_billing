export type StatementRow = {
    date: string;          // ISO date
    type: "Invoice" | "Credit Note" | "Payment";
    refNo: number;

    debit: number;         // + amount
    credit: number;        // - amount

    balance: number;       // running balance
};

export type SchoolStatement = {
    academicYear: string;

    school: {
        name: string;
        phone: string;
        email?: string
        gst?: string;
        street?: string,
        town?: string,
        district?: string,
        state?: string,
        pincode?: string,
    };

    rows: StatementRow[];

    closingBalance: number;
};
