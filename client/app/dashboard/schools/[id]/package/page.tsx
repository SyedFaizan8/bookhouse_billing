"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { deletePackage, useSchoolPackage } from "@/lib/queries/schools";
import RowActions, { Action } from "@/components/RowActions";
import { InvoiceRow } from "@/lib/types/customer";
import { Money } from "@/components/Money";
import { handleApiError } from "@/lib/utils/getApiError";
import { toast } from "sonner";
import { useAuthUser } from "@/lib/queries/auth";
import { PackageDeleteDialog } from "@/components/alertBox/PackageDeleteDialog";

const PAGE_SIZE = 8;

/* ======================================================
   PAGE
====================================================== */

export default function CustomerInvoicesPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [search, setSearch] = useState("");

    const { data = [], isLoading } = useSchoolPackage(id);
    const { data: user, isLoading: authLoading } = useAuthUser()

    const deleteMutation = deletePackage()

    const [target, setTarget] = useState<InvoiceRow | null>(null)

    const isAdmin = user?.role === "ADMIN"

    /* ======================================================
       FILTER
    ===================================================== */

    const filtered = useMemo(() => {
        if (!search) return data;

        return data.filter((i) =>
            i.documentNo.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    /* ======================================================
       PAGINATION
    ===================================================== */

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination({
        data: filtered,
        pageSize: PAGE_SIZE,
    });

    /* ======================================================
       COLUMNS (UPDATED)
    ===================================================== */

    const columns: Column<InvoiceRow>[] = useMemo(() => {
        const base: Column<InvoiceRow>[] = [
            {
                key: "documentNo",
                header: "Package No",
                render: (i) => (
                    <div className="font-semibold text-indigo-700">
                        {i.documentNo}
                    </div>
                ),
            },

            {
                key: "date",
                header: "Date",
                className: "hidden md:table-cell",
                render: (i) =>
                    new Date(i.date).toLocaleDateString("en-IN"),
            },

            {
                key: "totalQty",
                header: "Qty",
                className: "hidden lg:table-cell",
                render: (i) => i.totalQty,
            },

            {
                key: "pendingQty",
                header: "Pending",
                className: "font-semibold",
                render: (i) => (
                    <span
                        className={
                            i.pending && i.pending > 0
                                ? "text-red-600"
                                : "text-emerald-600"
                        }
                    >
                        {i.pending}
                    </span>
                ),
            },

            {
                key: "amount",
                header: "Amount",
                className: "text-right font-medium",
                render: (i) => <Money amount={i.amount} />,
            },

            /* ======================================================
               ONLY 3 CLEAN ACTIONS
            ===================================================== */

            {
                key: "actions",
                header: "",
                className: "text-right",
                render: (u) => {
                    const actions: Action[] = [
                        {
                            label: "Update Pending",
                            onClick: () => router.push(`/dashboard/package/${u.id}/pending`),
                            variant: "warning",
                        },
                        {
                            label: "Convert Invoice",
                            onClick: () => router.push(`/dashboard/invoices/new/${id}/${u.id}`),
                        },
                    ];

                    if (isAdmin) {
                        actions.push(
                            {
                                label: "Edit",
                                onClick: () =>
                                    router.push(`/dashboard/package/new/${id}/${u.id}`),
                            },
                            {
                                label: "Delete",
                                onClick: () => setTarget(u),
                                variant: "danger",
                            }
                        );
                    }

                    return <RowActions actions={actions} />;
                }
            }

        ];

        return base
    }, [isAdmin])
    /* ======================================================
       LOADING
    ===================================================== */

    if (isLoading || authLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={FileText}
                title="No package notes"
                description="No packages created yet."
                actionLabel="Create Package Note"
                actionHref={`/dashboard/package/new/${id}`}
            />
        );
    }

    /* ======================================================
       UI
    ===================================================== */

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <h1 className="text-xl font-semibold text-slate-800">
                Package Notes
            </h1>

            {/* SEARCH + ADD */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                {/* SEARCH */}
                <div className="relative max-w-sm w-full">
                    <Search
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={18}
                    />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                        placeholder="Search package no"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* CREATE */}
                <button
                    onClick={() =>
                        router.push(`/dashboard/package/new/${id}`)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
                >
                    <FileText size={18} />
                    New Package Note
                </button>
            </div>

            {/* TABLE */}
            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(u) => router.replace(`/dashboard/package/${u.id}`)}
            />

            {/* PAGINATION */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <PackageDeleteDialog
                open={!!target}
                pkg={target}
                loading={deleteMutation.isPending}
                onCancel={() => setTarget(null)}
                onConfirm={() => {
                    deleteMutation.mutate(target!.id, {
                        onSuccess: () => {
                            toast.success("Package Deleted successfully")
                            setTarget(null)
                        },
                        onError: (e) => toast.error(handleApiError(e).message),
                    })
                }}
            />

            <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
            </div>
        </div >
    );
}
