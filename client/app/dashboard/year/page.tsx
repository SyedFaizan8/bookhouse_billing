"use client"

import { useMemo, useState } from "react"
import { Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import Breadcrumbs from "@/components/Breadcrumbs"
import ResponsiveTable, { Column } from "@/components/ResponsiveTable"
import EmptyState from "@/components/EmptyState"
import RowActions from "@/components/RowActions"
import TableLoader from "@/components/loaders/TableLoader"

import { AcademicYear } from "@/lib/types/academicYear"
import {
    useAcademicYears,
    useCloseAcademicYear,
    useOpenAcademicYear,
} from "@/lib/queries/academicYear"
import { useAuthUser } from "@/lib/queries/auth"
import { handleApiError } from "@/lib/utils/getApiError"

import { AcademicYearCloseDialog } from "@/components/alertBox/AcademicYearCloseDialog"
import { AcademicYearOpenDialog } from "@/components/alertBox/AcademicYearOpenDialog"
import { useRouter } from "next/navigation"

export default function AcademicYearsPage() {
    const { data, isLoading } = useAcademicYears()
    const { data: user, isLoading: authLoading } = useAuthUser()

    const router = useRouter()

    const closeMutation = useCloseAcademicYear()
    const openMutation = useOpenAcademicYear()

    const [closeTarget, setCloseTarget] = useState<AcademicYear | null>(null)
    const [openTarget, setOpenTarget] = useState<AcademicYear | null>(null)

    const isAdmin = user?.role === "ADMIN"
    const rows = useMemo(() => data ?? [], [data])

    const columns: Column<AcademicYear>[] = useMemo(() => {
        const base: Column<AcademicYear>[] = [
            {
                key: "name",
                header: "Academic Year",
                render: (y) => (
                    <div>
                        <div className="font-medium">{y.name}</div>
                        <div className="text-xs text-slate-500">
                            {new Date(y.startDate).toLocaleDateString("en-IN")} →{" "}
                            {new Date(y.endDate).toLocaleDateString("en-IN")}
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
        ]

        if (isAdmin) {
            base.push({
                key: "actions",
                header: "",
                render: (y) => (
                    <RowActions
                        actions={
                            y.status === "OPEN"
                                ? [
                                    {
                                        label: "Close",
                                        onClick: () => setCloseTarget(y),
                                        variant: "danger",
                                    },
                                    {
                                        label: "Edit",
                                        onClick: () =>
                                            router.push(`/dashboard/year/${y.id}`),
                                    },
                                ]
                                : [
                                    {
                                        label: "Open",
                                        onClick: () => setOpenTarget(y),
                                        variant: "warning",
                                    },
                                ]
                        }
                    />
                ),
            })
        }

        return base
    }, [isAdmin])

    if (isLoading || authLoading) return <TableLoader />

    if (!rows.length) {
        return (
            <EmptyState
                icon={Calendar}
                title="No academic year"
                description="Create an academic year to start billing"
                actionLabel={isAdmin ? "Create Academic Year" : undefined}
                actionHref={isAdmin ? "/dashboard/year/new" : undefined}
            />
        )
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Academic Years" },
                ]}
            />

            {isAdmin && (
                <div className="flex justify-end">
                    <Link
                        href="/dashboard/year/new"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Academic Year
                    </Link>
                </div>
            )}

            <ResponsiveTable
                data={rows}
                columns={columns}
                getRowId={(r) => r.id}
            />

            {/* CLOSE */}
            <AcademicYearCloseDialog
                open={!!closeTarget}
                year={closeTarget}
                loading={closeMutation.isPending}
                onCancel={() => setCloseTarget(null)}
                onConfirm={() => {
                    closeMutation.mutate(closeTarget!.id, {
                        onSuccess: () => {
                            toast.success("Academic year closed successfully")
                            setCloseTarget(null)
                        },
                        onError: (e) =>
                            toast.error(handleApiError(e).message),
                    })
                }}
            />

            {/* OPEN */}
            <AcademicYearOpenDialog
                open={!!openTarget}
                year={openTarget}
                loading={openMutation.isPending}
                onCancel={() => setOpenTarget(null)}
                onConfirm={() => {
                    openMutation.mutate(openTarget!.id, {
                        onSuccess: () => {
                            toast.success("Academic year opened successfully")
                            setOpenTarget(null)
                        },
                        onError: (e) =>
                            toast.error(handleApiError(e).message),
                    })
                }}
            />
        </div>
    )
}
