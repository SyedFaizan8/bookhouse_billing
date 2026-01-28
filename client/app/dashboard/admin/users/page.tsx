"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Users } from "lucide-react"

import Breadcrumbs from "@/components/Breadcrumbs"
import ResponsiveTable, { Column } from "@/components/ResponsiveTable"
import RowActions from "@/components/RowActions"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"
import Pagination from "@/components/Pagination"
import TableLoader from "@/components/loaders/TableLoader"
import EmptyState from "@/components/EmptyState"

import { User } from "@/lib/types/user"
import { useUsers } from "@/lib/queries/users"
import { useSorting } from "@/lib/hooks/useSorting"
import { sortData } from "@/lib/utils/sortData"

const PAGE_SIZE = 10

export default function UsersPage() {
    const router = useRouter()
    const currentUserRole = "ADMIN" // update this

    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)

    const { sortBy, order, toggleSort } = useSorting<"name" | "createdAt" | "role">("createdAt")

    const { data: users = [], isLoading } = useUsers()

    /* ---------------- FILTER + SORT ---------------- */

    const processed: User[] = useMemo(() => {
        let rows = users

        if (search) {
            const q = search.toLowerCase()
            rows = rows.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.phone.includes(search)
            )
        }

        return sortData(rows, sortBy, order)
    }, [users, search, sortBy, order])

    /* ---------------- PAGINATION ---------------- */

    const totalPages = Math.ceil(processed.length / PAGE_SIZE)

    const pageData = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return processed.slice(start, start + PAGE_SIZE)
    }, [processed, page])

    /* ---------------- TABLE ---------------- */

    const sortHeader = (label: string, key: typeof sortBy) => (
        <button onClick={() => toggleSort(key)} className="flex items-center gap-1">
            {label}
            {sortBy === key && (order === "asc" ? "↑" : "↓")}
        </button>
    )

    const columns: Column<User>[] = [
        {
            key: "name",
            header: sortHeader("User", "name"),
            render: (u) => (
                <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500 md:hidden">{u.email}</div>
                </div>
            ),
        },
        {
            key: "mobile",
            header: "Phone",
            className: "hidden md:table-cell",
            render: (u) => u.phone,
        },
        {
            key: "role",
            header: sortHeader("Role", "role"),
            className: "hidden md:table-cell",
            render: (u) => (
                <span className={`rounded-full ${u.role === 'STAFF' ? "bg-slate-100" : u.role === 'ADMIN' ? 'bg-green-200' : 'bg-yellow-200'} px-2 py-0.5 text-xs font-medium`}>
                    {u.role}
                </span>
            ),
        },
        {
            key: "createdAt",
            header: sortHeader("Added On", "createdAt"),
            className: "hidden lg:table-cell text-slate-500",
            render: (u) =>
                new Date(u.createdAt).toLocaleDateString("en-IN"),
        },
        {
            key: "actions",
            header: "",
            render: (u) =>
                <RowActions
                    actions={
                        [{
                            label: "Edit",
                            onClick: () => router.push(`/dashboard/admin/users/${u.id}/edit`),
                            variant: "default"
                        }]
                    }
                />
        },
    ]

    /* ---------------- STATES ---------------- */

    if (isLoading) return <TableLoader />

    if (!users.length) {
        return (
            <EmptyState
                icon={Users}
                title="No users found"
                description="Create users to manage the system"
                actionLabel="Add User"
                actionHref="/dashboard/admin/users/new"
            />
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard/admin/users" },
                    { label: "Users" },
                ]}
            />

            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search name, phone"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                {currentUserRole === "ADMIN" && (
                    <Link
                        href="/dashboard/admin/users/new"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add User
                    </Link>
                )}
            </div>

            <ResponsiveTable<User>
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
            />

            <div className="sticky bottom-0">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, processed.length)} of {processed.length}
            </div>

        </div>
    )
}
