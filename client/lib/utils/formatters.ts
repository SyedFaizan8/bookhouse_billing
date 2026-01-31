export const formatINR = (amount: number) => amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })

export const formatMoney = (value: number) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })