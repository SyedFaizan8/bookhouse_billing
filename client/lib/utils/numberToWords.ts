export const numberToWords = (amount: number): string => {
    if (amount === 0) return "Zero";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen",
    ];

    const b = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const inWords = (num: number): string => {
        if (num < 20) return a[num];
        if (num < 100)
            return `${b[Math.floor(num / 10)]} ${a[num % 10]}`.trim();
        if (num < 1000)
            return `${a[Math.floor(num / 100)]} Hundred ${inWords(num % 100)}`.trim();
        if (num < 100000)
            return `${inWords(Math.floor(num / 1000))} Thousand ${inWords(num % 1000)}`.trim();
        if (num < 10000000)
            return `${inWords(Math.floor(num / 100000))} Lakh ${inWords(num % 100000)}`.trim();

        return `${inWords(Math.floor(num / 10000000))} Crore ${inWords(num % 10000000)}`.trim();
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let words = "";

    if (rupees > 0) {
        words += `Rupees ${inWords(rupees)}`;
    }

    if (paise > 0) {
        words += `${rupees > 0 ? " and " : ""}${inWords(paise)} Paise`;
    }

    return `${words} Only`;
};