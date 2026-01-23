export default function ChartCard({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {title}
            </h3>
            {children}
        </div>
    )
}
