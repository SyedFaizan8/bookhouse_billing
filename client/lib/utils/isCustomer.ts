import { Customer } from "@/lib/types/customer"

export function isCustomer(value: unknown): value is Customer {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as Customer).id === "string" &&
        typeof (value as Customer).name === "string" &&
        typeof (value as Customer).phone === "string"
    )
}
