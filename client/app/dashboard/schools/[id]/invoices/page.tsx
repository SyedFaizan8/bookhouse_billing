"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { useSchoolInvoices, voidInvoice } from "@/lib/queries/schools";
import { InvoiceRow } from "@/lib/types/customer";
import RowActions from "@/components/RowActions";
import { useAuthUser } from "@/lib/queries/auth";
import { InvoiceVoidDialog } from "@/components/alertBox/InvoiceVoid";
import { toast } from "sonner";
import { handleApiError } from "@/lib/utils/getApiError";
import { Money } from "@/components/Money";

const PAGE_SIZE = 10;

export default function CustomerInvoicesPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [search, setSearch] = useState("");

    const { data = [], isLoading } = useSchoolInvoices(id);
    const { data: user, isLoading: authLoading } = useAuthUser()

    const voidInvoiceMutation = voidInvoice()

    const [voidTarget, setVoidTarget] = useState<InvoiceRow | null>(null)

    const isAdmin = user?.role === "ADMIN"

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

    const columns: Column<InvoiceRow>[] = useMemo(() => {

        const base: Column<InvoiceRow>[] = [
            {
                key: "invoiceNo",
                header: "Invoice No",
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
                render: (i) => new Date(i.date).toLocaleDateString("en-IN"),
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
                className: "text-right font-medium",
                render: (i) => <Money amount={i.amount} />,
            },
            {
                key: "status",
                header: "Status",
                className: "text-right",
                render: (i) => (<span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${i.status === "ISSUED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                    `}
                >
                    {i.status === "ISSUED" ? "Issued" : "Voided"}
                </span>)
            }
        ];


        if (isAdmin) {
            base.push({
                key: "actions",
                header: "",
                className: "text-right font-medium",
                render: (y) => (
                    <RowActions
                        actions={
                            y.status === "ISSUED"
                                ? [
                                    {
                                        label: "VOID",
                                        onClick: () => setVoidTarget(y),
                                        variant: "danger",
                                    },
                                ] : []
                        }
                    />
                ),
            })
        }

        return base
    }, [isAdmin])

    if (isLoading || authLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={FileText}
                title="No invoices issued"
                description="No invoices created for this schools yet."
                actionLabel="Create Invoice"
                actionHref={`/dashboard/invoices/new/${id}`}
            />
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Invoices</h1>

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
                        placeholder="Search invoice no"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* ADD INVOICE */}
                <button
                    onClick={() =>
                        router.push(`/dashboard/invoices/new/${id}`)
                    }
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
                >
                    <FileText size={18} />
                    Add Invoice
                </button>
            </div>


            {/* TABLE */}
            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) =>
                    router.push(
                        `/dashboard/invoices/${row.id}`
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

            <InvoiceVoidDialog
                open={!!voidTarget}
                invoice={voidTarget}
                loading={voidInvoiceMutation.isPending}
                onCancel={() => setVoidTarget(null)}
                onConfirm={() => {
                    voidInvoiceMutation.mutate(voidTarget!.id, {
                        onSuccess: () => {
                            toast.success("Invoice Voided successfully")
                            setVoidTarget(null)
                        },
                        onError: (e) =>
                            toast.error(handleApiError(e).message),
                    })
                }}
            />
        </div>
    );
}
