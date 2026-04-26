import { UseFormReturn } from "react-hook-form";

export type SortDirection = "asc" | "desc";

export function useSortableItems<T extends Record<string, any>>(
    form: UseFormReturn<any>,
    replace: (items: T[]) => void
) {
    const sortItems = (
        key: keyof T,
        direction: SortDirection = "asc"
    ) => {
        const currentItems = form.getValues("items") as T[];

        const sorted = [...currentItems].sort((a, b) => {
            const aRaw = a[key];
            const bRaw = b[key];

            // ✅ Normalize safely (no type mutation)
            const normalize = (val: unknown): string | number => {
                if (val == null) return "";

                if (typeof val === "string") {
                    return val.trim().toLowerCase();
                }

                if (typeof val === "number") {
                    return val;
                }

                return String(val).toLowerCase();
            };

            const aVal = normalize(aRaw);
            const bVal = normalize(bRaw);

            if (aVal < bVal) return direction === "asc" ? -1 : 1;
            if (aVal > bVal) return direction === "asc" ? 1 : -1;
            return 0;
        });

        replace(sorted);
    };

    return { sortItems };
}