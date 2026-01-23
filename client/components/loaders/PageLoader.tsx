export default function PageLoader() {
    return (
        <div className="space-y-6 animate-pulse">

            {/* Title skeleton */}
            <div className="h-6 w-48 rounded-md bg-slate-200" />

            {/* Profile card skeleton */}
            <div className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-4">
                <div className="h-5 w-64 bg-slate-200 rounded" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-12 rounded-md bg-slate-100"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
