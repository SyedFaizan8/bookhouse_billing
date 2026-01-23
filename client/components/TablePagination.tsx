"use client"

type Props = {
    page: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}

export default function TablePagination({
    page,
    totalPages,
    onPrev,
    onNext,
}: Props) {
    return (
        <div className="flex items-center justify-between text-sm">
            <button
                disabled={page === 1}
                onClick={onPrev}
                className="px-3 py-1 rounded border disabled:opacity-50"
            >
                Prev
            </button>

            <span>
                Page {page} of {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={onNext}
                className="px-3 py-1 rounded border disabled:opacity-50"
            >
                Next
            </button>
        </div>
    )
}
