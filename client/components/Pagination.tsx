"use client"

type Props = {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    hasNextPage?: boolean
    isFetchingNext?: boolean
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
    hasNextPage,
    isFetchingNext,
}: Props) {
    const maxVisible = 5

    const start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    const pages = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
    )

    return (
        <div className="flex items-center justify-between gap-4 border-t pt-4 mt-2 text-sm bg-white rounded-xl p-4">
            {/* Left */}
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
            >
                ← Prev
            </button>

            {/* Center */}
            <div className="flex gap-1 hidden md:flex">
                {start > 1 && (
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-3 py-1 rounded-md border hover:bg-slate-50 cursor-pointer"
                    >
                        1
                    </button>
                )}

                {start > 2 && <span className="px-2">…</span>}

                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1 rounded-md border transition cursor-pointer
                            ${p === page
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "hover:bg-slate-50"
                            }`}
                    >
                        {p}
                    </button>
                ))}

                {end < totalPages - 1 && <span className="px-2">…</span>}

                {end < totalPages && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="px-3 py-1 rounded-md border hover:bg-slate-50 cursor-pointer"
                    >
                        {totalPages}
                    </button>
                )}
            </div>

            {/* Right */}
            <button
                disabled={page === totalPages && !hasNextPage}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-50"
            >
                {isFetchingNext ? "Loading…" : "Next →"}
            </button>
        </div>
    )
}
