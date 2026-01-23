export default function FormLoader() {
    return (
        <div className="animate-pulse rounded-xl bg-white p-6 ring-1 ring-black/5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {Array.from({ length: 11 }).map((_, i) => (
                    <div
                        key={i}
                        className={i === 3 ? "md:col-span-2" : ""}
                    >
                        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                        <div className="h-10 w-full bg-slate-100 rounded-md" />
                    </div>
                ))}

                {/* Submit button */}
                <div className="md:col-span-2 flex justify-end">
                    <div className="h-10 w-32 bg-slate-200 rounded-md" />
                </div>

            </div>
        </div>
    )
}
