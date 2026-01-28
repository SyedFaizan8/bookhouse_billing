export default function DashboardLoading() {
    return (
        <div className="w-full animate-pulse">

            {/* Page Header */}
            <div className="mb-8">
                <div className="h-6 w-40 bg-slate-200 rounded-md" />
                <div className="mt-2 h-4 w-64 bg-slate-100 rounded-md" />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2  gap-6 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-md bg-white p-5 ring-1 ring-black/5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-7 w-16 bg-slate-200 rounded-md" />
                                <div className="mt-2 h-4 w-32 bg-slate-100 rounded-md" />
                            </div>
                            <div className="h-11 w-11 rounded-full bg-slate-100" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="space-y-6">

                {/* Top charts */}
                <div className="grid grid-cols-1 gap-6">
                    <ChartSkeleton />
                </div>

            </div>
        </div>
    )
}

/* small helper */
function ChartSkeleton() {
    return (
        <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
            <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
            <div className="h-56 w-full bg-slate-100 rounded-lg" />
        </div>
    )
}
