export function sortData<T>(
    data: T[],
    key: keyof T,
    order: "asc" | "desc"
) {
    return [...data].sort((a: any, b: any) => {
        const av =
            typeof a[key] === "string"
                ? Number(a[key])
                : a[key]

        const bv =
            typeof b[key] === "string"
                ? Number(b[key])
                : b[key]

        if (av < bv) return order === "asc" ? -1 : 1
        if (av > bv) return order === "asc" ? 1 : -1
        return 0
    })
}
