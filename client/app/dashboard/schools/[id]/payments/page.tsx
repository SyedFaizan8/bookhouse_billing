"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, IndianRupee, Search } from "lucide-react";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { reversePayment, useSchoolPayments } from "@/lib/queries/schools";
import { PaymentRow } from "@/lib/types/payments";
import { useAuthUser } from "@/lib/queries/auth";
import RowActions from "@/components/RowActions";
import { SchoolPaymentReverseDialog } from "@/components/alertBox/SchoolPaymentReverseDialog";
import { handleApiError } from "@/lib/utils/getApiError";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [search, setSearch] = useState("");

    const { data = [], isLoading } = useSchoolPayments(id);
    const { data: user, isLoading: authLoading } = useAuthUser()

    const ReversePaymentMutation = reversePayment()

    const [voidTarget, setVoidTarget] = useState<PaymentRow | null>(null)

    const isAdmin = user?.role === "ADMIN"

    /* ======================================================
       SEARCH FILTER
    ====================================================== */

    const filtered = useMemo(() => {
        if (!search) return data;

        return data.filter((p) =>
            p.receiptNo
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [data, search]);

    /* ======================================================
       PAGINATION
    ====================================================== */

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
       TABLE COLUMNS
    ====================================================== */


    const columns: Column<PaymentRow>[] = useMemo(() => {

        const base: Column<PaymentRow>[] = [
            {
                key: "receiptNo",
                header: "Receipt No",
                render: (p) => (
                    <div>
                        <div className="font-medium text-indigo-700">
                            {p.receiptNo}
                        </div>

                        {/* mobile */}
                        <div className="text-xs text-slate-500 md:hidden">
                            {new Date(p.date).toLocaleDateString("en-IN")}
                        </div>
                    </div>
                ),
            },
            {
                key: "date",
                header: "Date",
                className: "hidden md:table-cell",
                render: (p) =>
                    new Date(p.date).toLocaleDateString("en-IN"),
            },
            {
                key: "mode",
                header: "Mode",
                className: "hidden sm:table-cell",
                render: (p) => p.mode,
            },
            {
                key: "amount",
                header: "Amount",
                className:
                    "text-right font-semibold text-green-600",
                render: (p) =>
                    `₹${p.amount.toLocaleString("en-IN")}`,
            },
            {
                key: "status",
                header: "Status",
                className: "text-right",
                render: (i) => (<span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${i.status === "POSTED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                                `}
                >
                    {i.status === "POSTED" ? "Posted" : "Reversed"}
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
                            y.status === "POSTED"
                                ? [
                                    {
                                        label: "Reverse",
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

    /* ======================================================
       STATES
    ====================================================== */

    if (isLoading || authLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={IndianRupee}
                title="No payments recorded"
                description="No payments have been recorded for this school yet."
                actionLabel="Add Payment"
                actionHref={`/dashboard/payments/${id}/new`}
            />
        );
    }

    /* ======================================================
       UI
    ====================================================== */

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">
                Payments
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
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search receipt number"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* ADD PAYMENT */}
                <button
                    onClick={() =>
                        router.push(`/dashboard/payments/${id}/new`)
                    }
                    className="
                        bg-indigo-600 hover:bg-indigo-700
                        text-white px-4 py-2 rounded-md
                        flex items-center gap-2
                        whitespace-nowrap
                    "
                >
                    <Plus size={18} />
                    Add Payment
                </button>
            </div>

            {/* TABLE */}
            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(r) => r.id}
                onRowClick={(r) =>
                    router.push(`/dashboard/payments/${r.id}`)
                }
            />

            {/* PAGINATION */}
            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* FOOTER */}
            <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} payments
            </div>

            <SchoolPaymentReverseDialog
                open={!!voidTarget}
                payment={voidTarget}
                loading={ReversePaymentMutation.isPending}
                onCancel={() => setVoidTarget(null)}
                onConfirm={() => {
                    ReversePaymentMutation.mutate(voidTarget!.id, {
                        onSuccess: () => {
                            toast.success("Payment Reversed successfully")
                            setVoidTarget(null)
                        },
                        onError: (e) => toast.error(handleApiError(e).message),
                    })
                }}
            />
        </div>
    );
}
