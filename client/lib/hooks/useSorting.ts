import { useState } from "react"

export type SortOrder = "asc" | "desc"

export function useSorting<S extends string>(
    defaultSort: S,
    defaultOrder: SortOrder = "desc"
) {
    const [sortBy, setSortBy] = useState<S>(defaultSort)
    const [order, setOrder] = useState<SortOrder>(defaultOrder)

    const toggleSort = (key: S) => {
        if (sortBy === key) {
            setOrder((o) => (o === "asc" ? "desc" : "asc"))
        } else {
            setSortBy(key)
            setOrder("asc")
        }
    }

    return { sortBy, order, toggleSort }
}
