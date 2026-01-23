"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LibraryBig, Plus, Search } from "lucide-react"

import Breadcrumbs from "@/components/Breadcrumbs"
import ResponsiveTable, { Column } from "@/components/ResponsiveTable"
import TableLoader from "@/components/loaders/TableLoader"
import EmptyState from "@/components/EmptyState"
import Pagination from "@/components/Pagination"

import { Company } from "@/lib/types/dealer"
import { useDealersInfinite } from "@/lib/queries/dealers"
import { useSorting } from "@/lib/hooks/useSorting"
import { useClientPagination } from "@/lib/hooks/useClientPagination"
import { sortData } from "@/lib/utils/sortData"

const PAGE_SIZE = 10

export default function DealersPage() {
    const router = useRouter()

    const [search, setSearch] = useState("")
    const [menuOpen, setMenuOpen] = useState<string | null>(null)

    const { sortBy, order, toggleSort } =
        useSorting<"name" | "addedOn" | "amountDue">("addedOn")

    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useDealersInfinite(sortBy, order)

    const allRows: Company[] = useMemo(() => {
        const rows =
            data?.pages.flatMap((p) => p.items ?? []) ?? []

        return rows.length <= 500
            ? sortData(rows, sortBy, order)
            : rows
    }, [data, sortBy, order])

    const filtered: Company[] = useMemo(() => {
        if (!search) return allRows
        const q = search.toLowerCase()

        return allRows.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.phone.includes(search)
        )
    }, [allRows, search])

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination({
        data: filtered,
        pageSize: PAGE_SIZE,
        fetchNext: fetchNextPage,
        hasNextPage,
    })

    const sortHeader = (label: string, key: typeof sortBy) => (
        <button
            onClick={() => toggleSort(key)}
            className="flex items-center gap-1"
        >
            {label}
            {sortBy === key && (order === "asc" ? "↑" : "↓")}
        </button>
    )

    const columns: Column<Company>[] = [
        {
            key: "name",
            header: sortHeader("Company Name", "name"),
            render: (d) => (
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${!d.active ? "line-through text-slate-400" : ""}`}>
                            {d.name}
                        </span>

                        {!d.active && (
                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                                Inactive
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 md:hidden">
                        {d.phone}
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            className: "hidden md:table-cell",
            render: (d) => d.phone,
        },
        {
            key: "amountDue",
            header: sortHeader("Amount Due", "amountDue"),
            className: "hidden md:table-cell text-rose-600 font-medium",
            render: (d) => `₹${d.amountDue.toLocaleString()}`,
        },
        {
            key: "addedOn",
            header: sortHeader("Added On", "addedOn"),
            className: "hidden lg:table-cell text-slate-500",
            render: (d) =>
                new Date(d.addedOn).toLocaleDateString("en-IN"),
        },
    ]

    if (isLoading) return <TableLoader />

    if (!allRows.length) {
        return (
            <EmptyState
                icon={LibraryBig}
                title="No companies found"
                description="Add publishers or book suppliers."
                actionLabel="Add Company"
                actionHref="/dashboard/companies/new"
            />
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Companies" },
            ]} />

            <div className="flex justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search by name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Link
                    href="/dashboard/companies/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Company
                </Link>
            </div>

            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) => {
                    if (menuOpen) return
                    router.push(`/dashboard/companies/${row.id}`)
                }}
            />

            <div className="sticky bottom-0">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    hasNextPage={hasNextPage}
                    isFetchingNext={isFetchingNextPage}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </div>
    )
}
