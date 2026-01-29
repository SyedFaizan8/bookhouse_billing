"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { deleteEstimation, useSchoolEstimations } from "@/lib/queries/schools";
import RowActions from "@/components/RowActions";
import { InvoiceRow } from "@/lib/types/customer";
import { useAuthUser } from "@/lib/queries/auth";
import { EstimationDeleteDialog } from "@/components/alertBox/EstimationDeleteDialog";
import { toast } from "sonner";
import { handleApiError } from "@/lib/utils/getApiError";

const PAGE_SIZE = 5;

export default function CustomerInvoicesPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [search, setSearch] = useState("");

    const { data = [], isLoading } = useSchoolEstimations(id);

    const deleteMutation = deleteEstimation()

    const [target, setTarget] = useState<InvoiceRow | null>(null)

    const filtered = useMemo(() => {
        if (!search) return data;
        return data.filter((i) =>
            i.documentNo.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination({
        data: filtered,
        pageSize: PAGE_SIZE,
    });

    const columns: Column<InvoiceRow>[] = [
        {
            key: "documentNo",
            header: "Estimation No",
            render: (i) => (
                <div className="font-medium text-indigo-700">
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
            key: "amount",
            header: "Amount",
            className: "text-right font-medium text-rose-600",
            render: (i) => `₹${i.amount.toLocaleString()}`,
        },
        {
            key: "actions",
            header: "",
            className: "text-black text-xs",
            render: (u) =>
                <RowActions
                    actions={
                        [
                            {
                                label: "Package Note",
                                onClick: () => router.replace(`/dashboard/package/${u.id}`)
                            },
                            {
                                label: "Convert To Invoice",
                                onClick: () => router.replace(`/dashboard/invoices/new/${id}/${u.id}`),
                                variant: 'warning'
                            },
                            {
                                label: "Delete",
                                onClick: () => setTarget(u),
                                variant: "danger",
                            },
                        ]
                    }
                />
        },
    ];

    if (isLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={FileText}
                title="No estimations issued"
                description="No estimations created for this schools yet."
                actionLabel="Create Estimation"
                actionHref={`/dashboard/estimations/new/${id}`}
            />
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Estimations</h1>

            {/* SEARCH + ADD INVOICE */}
            <div className="flex flex-col md:flex-row md:justify-between  md:items-center gap-4">
                {/* SEARCH */}
                <div className="relative max-w-sm w-full">
                    <Search
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={18}
                    />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search estimation no"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* ADD INVOICE */}
                <button
                    onClick={() =>
                        router.push(`/dashboard/estimations/new/${id}`)
                    }
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
                >
                    <FileText size={18} />
                    Add Estimation
                </button>
            </div>


            {/* TABLE */}
            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) =>
                    router.push(
                        `/dashboard/estimations/${row.id}`
                    )
                }
            />

            {/* PAGINATION */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
            </div>

            <EstimationDeleteDialog
                open={!!target}
                estimation={target}
                loading={deleteMutation.isPending}
                onCancel={() => setTarget(null)}
                onConfirm={() => {
                    deleteMutation.mutate(target!.id, {
                        onSuccess: () => {
                            toast.success("Estimation Deleted successfully")
                            setTarget(null)
                        },
                        onError: (e) =>
                            toast.error(handleApiError(e).message),
                    })
                }}
            />

        </div>
    );
}
