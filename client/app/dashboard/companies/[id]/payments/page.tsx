"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, IndianRupee, Search } from "lucide-react";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { PaymentRow } from "@/lib/types/payments";
import { useCompanyPayments } from "@/lib/queries/company";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [search, setSearch] = useState("");

    const { data = [], isLoading } = useCompanyPayments(id);

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

    const columns: Column<PaymentRow>[] = [
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
    ];

    /* ======================================================
       STATES
    ====================================================== */

    if (isLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={IndianRupee}
                title="No payments recorded"
                description="No payments have been recorded for this school yet."
                actionLabel="Add Payment"
                actionHref={`/dashboard/companies/${id}/payments/new`}
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
                        router.push(`/dashboard/companies/${id}/payments/new`)
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
                    router.push(`/dashboard/companies/${id}/payments/${r.id}`)
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
        </div>
    );
}
