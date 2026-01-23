import { useInfiniteQuery } from "@tanstack/react-query"

export type Page<T> = {
    items: T[]
    nextCursor: string | null
}

export function useCursorPagination<T, S extends string>({
    queryKey,
    fetchFn,
    sortBy,
    order,
    limit = 500,
}: {
    queryKey: any[]
    fetchFn: (args: {
        cursor?: string | null
        sortBy: S
        order: "asc" | "desc"
        limit: number
    }) => Promise<Page<T>>
    sortBy: S
    order: "asc" | "desc"
    limit?: number
}) {
    return useInfiniteQuery<
        Page<T>,        // queryFn return
        Error,          // error
        Page<T>,        // data
        any[],          // query key
        string | null   // pageParam (CRITICAL)
    >({
        queryKey: [...queryKey, sortBy, order],
        queryFn: ({ pageParam }) =>
            fetchFn({
                cursor: pageParam,
                sortBy,
                order,
                limit,
            }),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
}
