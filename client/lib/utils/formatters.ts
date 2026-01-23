export const currency = (value?: number) =>
    typeof value === "number"
        ? `₹${value.toLocaleString()}`
        : "₹0"
