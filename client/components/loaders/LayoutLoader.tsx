import clsx from "clsx";

export default function LayoutLoader() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r p-4 gap-4">
                <SkeletonBox className="h-8 w-40" />
                <div className="mt-6 flex flex-col gap-3">
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-5/6" />
                    <SkeletonBox className="h-4 w-4/6" />
                    <SkeletonBox className="h-4 w-3/6" />
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6">
                    <SkeletonBox className="h-6 w-48 mb-2" />
                    <SkeletonBox className="h-4 w-64" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border p-4 space-y-3"
                        >
                            <SkeletonBox className="h-4 w-1/2" />
                            <SkeletonBox className="h-8 w-full" />
                            <SkeletonBox className="h-3 w-3/4" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export function SkeletonBox({ className }: { className?: string; }) {
    return <div className={clsx("animate-pulse rounded-md bg-gray-200", className)} />
}