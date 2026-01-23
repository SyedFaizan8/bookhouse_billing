"use client"

import { useMemo, useState } from "react"
import { Plus, Calendar } from "lucide-react"

import Breadcrumbs from "@/components/Breadcrumbs"
import ResponsiveTable, { Column } from "@/components/ResponsiveTable"
import EmptyState from "@/components/EmptyState"
import RowActions from "@/components/RowActions"
import DeleteConfirmModal from "@/components/DeleteConfirmModal"

import { AcademicYear } from "@/lib/types/academicYear"
import {
    useAcademicYears,
    useCloseAcademicYear,
} from "@/lib/queries/academicYear"
import Link from "next/link"
import TableLoader from "@/components/loaders/TableLoader"
import { useAuthUser } from "@/lib/queries/auth"

export default function AcademicYearsPage() {
    const { data, isLoading } = useAcademicYears()
    const closeMutation = useCloseAcademicYear()
    const { data: user } = useAuthUser()

    const [menuOpen, setMenuOpen] = useState<string | null>(null)
    const [closeTarget, setCloseTarget] = useState<AcademicYear | null>(null)

    const rows = useMemo(() => data ?? [], [data])

    const columns: Column<AcademicYear>[] = [
        {
            key: "name",
            header: "Academic Year",
            render: (y) => (
                <div>
                    <div className="font-medium">{y.name}</div>
                    <div className="text-xs text-slate-500">
                        {new Date(y.startDate).toLocaleDateString()} →{" "}
                        {new Date(y.endDate).toLocaleDateString()}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (y) => (
                <span
                    className={
                        y.status === "OPEN"
                            ? "text-green-600 font-medium"
                            : "text-slate-500"
                    }
                >
                    {y.status}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            render: (y) => (user?.role === 'ADMIN' &&
                <RowActions
                    open={menuOpen === y.id}
                    onOpen={() => setMenuOpen(y.id)}
                    onClose={() => setMenuOpen(null)}
                    onDeactivate={
                        y.status === "OPEN"
                            ? () => setCloseTarget(y)
                            : undefined
                    }
                    dType="Close"
                />
            ),
        }
    ]

    if (isLoading) return <TableLoader />

    if (!rows.length) {
        return (
            <EmptyState
                icon={Calendar}
                title="No academic year"
                description="Create an academic year to start billing"
                actionLabel="Create Academic Year"
                actionHref="/dashboard/year/new"
            />
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Academic Years" },
            ]} />

            <div className="flex justify-end">
                <Link
                    href="/dashboard/year/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Academic Year
                </Link>
            </div>

            <ResponsiveTable
                data={rows}
                columns={columns}
                getRowId={(r) => r.id}
            />

            <DeleteConfirmModal
                open={!!closeTarget}
                setMenu={setMenuOpen}
                title="Close academic year?"
                description={`Closing ${closeTarget?.name} will lock all billing data.`}
                confirmLabel="Close Year"
                loading={closeMutation.isPending}
                onCancel={() => setCloseTarget(null)}
                onConfirm={() => {
                    closeMutation.mutate(closeTarget!.id)
                    setCloseTarget(null)
                }}
            />
        </div>
    )
}
