"use client"

import { ReactNode, MouseEvent } from "react"
import Spinner from "./Spinner"

export type Column<T> = {
    key: string
    header: ReactNode
    className?: string
    render: (row: T, index: number) => ReactNode
}

type Props<T> = {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (row: T) => void
    getRowId?: (row: T) => string | number
    loading?: boolean
}

export default function ResponsiveTable<T>({
    data,
    columns,
    onRowClick,
    getRowId,
    loading
}: Props<T>) {
    const handleRowClick = (e: MouseEvent, row: T) => {
        const target = e.target as HTMLElement
        if (target.closest("button, a, [role='menu']")) return
        onRowClick?.(row)
    }

    return (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-black/5 shadow-sm">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left font-medium ${col.className ?? ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={999} className="py-10">
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Spinner size={18} />
                                    <span className="text-sm">loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                                No data found
                            </td>
                        </tr>
                    ) : (data.map((row, index) => {
                        const key = getRowId?.(row) ?? (row as any).id
                        return (
                            <tr
                                key={key}
                                onClick={(e) => handleRowClick(e, row)}
                                className={`border-t transition ${onRowClick
                                    ? "cursor-pointer hover:bg-slate-50"
                                    : ""
                                    }`}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-4 py-3 ${col.className ?? ""}`}
                                    >
                                        {col.render(row, index)}
                                    </td>
                                ))}
                            </tr>
                        )
                    }))}
                </tbody>
            </table>
        </div>
    )
}
