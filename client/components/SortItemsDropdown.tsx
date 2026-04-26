
type Option<T> = {
    label: string;
    key: keyof T;
    direction: "asc" | "desc";
};

type Props<T> = {
    options: Option<T>[];
    onSort: (key: keyof T, direction: "asc" | "desc") => void;
};

export default function SortItemsDropdown<T>({
    options,
    onSort,
}: Props<T>) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="text-sm font-medium text-slate-700">
                Sort items
            </div>

            <select
                defaultValue=""
                onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;

                    const [key, direction] = value.split("|");
                    onSort(key as keyof T, direction as "asc" | "desc");
                }}
                className="
                    w-full sm:w-72
                    border border-slate-300
                    rounded-lg
                    bg-white
                    px-3 py-2
                    text-sm
                    text-slate-700
                    shadow-sm
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                "
            >
                <option value="" disabled>
                    Choose sort order
                </option>

                {options.map((opt, i) => (
                    <option
                        key={i}
                        value={`${String(opt.key)}|${opt.direction}`}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}