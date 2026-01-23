export default function TableLoader() {
    return (
        <div className="space-y-6 animate-pulse">

            {/* Breadcrumbs */}
            <div className="flex gap-2 text-sm">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>

            {/* Search + Button */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                <div className="h-10 w-full max-w-sm bg-slate-200 rounded-md" />
                <div className="h-10 w-36 bg-slate-200 rounded-md" />
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">

                {/* Table header */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 px-4 py-3 bg-slate-50">
                    <Skeleton />
                    <Skeleton className="hidden md:block" />
                    <Skeleton className="hidden md:block" />
                    <Skeleton className="hidden lg:block" />
                    <Skeleton />
                </div>

                {/* Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-3 md:grid-cols-5 gap-4 px-4 py-4 border-t"
                    >
                        {/* Name + phone */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24 md:hidden" />
                        </div>

                        <Skeleton className="hidden md:block h-4 w-24" />
                        <Skeleton className="hidden md:block h-4 w-20" />
                        <Skeleton className="hidden lg:block h-4 w-28" />
                        <Skeleton className="h-4 w-6 justify-self-end" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-end gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-8 w-8 bg-slate-200 rounded-md"
                    />
                ))}
            </div>

        </div>
    )
}

/* -------- Helper -------- */

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`bg-slate-200 rounded ${className || "h-4 w-full"}`}
        />
    )
}
