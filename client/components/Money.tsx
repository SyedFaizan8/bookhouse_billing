export function Money({ amount }: { amount: number | string }) {
    return (
        <span className="flex justify-end items-baseline font-semibold tabular-nums text-emerald-700">
            <span className="text-sm relative top-[1px] mr-0.5">₹</span>
            <span className="text-base leading-none">
                {Number(amount).toLocaleString("en-IN")}
            </span>
        </span>
    )
}
