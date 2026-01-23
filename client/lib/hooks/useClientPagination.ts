import { useEffect, useState } from "react";

export function useClientPagination<T>({
    data,
    pageSize,
    fetchNext,
    hasNextPage,
}: {
    data: T[];
    pageSize: number;
    fetchNext?: () => void;
    hasNextPage?: boolean;
}) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

    const safePage = Math.min(page, totalPages)

    const pageData = data.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    // 🔥 Auto load more from server when reaching last page
    useEffect(() => {
        if (
            safePage === totalPages &&
            hasNextPage &&
            fetchNext
        ) {
            fetchNext();
        }
    }, [safePage, totalPages, hasNextPage]);

    return {
        page: safePage,
        setPage,
        totalPages,
        pageData,
    };
}
