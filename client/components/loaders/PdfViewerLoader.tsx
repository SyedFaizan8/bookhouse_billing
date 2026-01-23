export default function PdfViewerLoader() {
    return (
        <div className="min-h-screen space-y-4 animate-pulse">

            {/* Top bar */}
            <div className="flex justify-end">
                <div className="h-10 w-40 rounded bg-slate-200" />
            </div>

            {/* PDF container */}
            <div className="h-[90vh] rounded border bg-white p-6 flex items-center justify-center">
                <div className="w-full max-w-3xl space-y-6">

                    {/* Fake PDF header */}
                    <div className="space-y-3">
                        <div className="h-6 w-1/3 bg-slate-200 rounded" />
                        <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    </div>

                    {/* Fake content lines */}
                    <div className="space-y-3 mt-8">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-4 bg-slate-200 rounded ${i % 3 === 0 ? "w-4/5" : "w-full"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-10 space-y-2">
                        <div className="h-4 w-1/4 bg-slate-200 rounded" />
                        <div className="h-4 w-1/5 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
