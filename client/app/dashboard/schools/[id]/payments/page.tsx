"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import Pagination from "@/components/Pagination";

import { useCustomerPayments } from "@/lib/queries/payments";
import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { PaymentRow } from "@/lib/types/payments";

const PAGE_SIZE = 10;

export default function PaymentsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data = [], isLoading } = useCustomerPayments(id);

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination({
        data,
        pageSize: PAGE_SIZE,
    });

    const columns: Column<PaymentRow>[] = [
        {
            key: "receiptNo",
            header: "Receipt No",
            render: (p) => (
                <div>
                    <div className="font-medium text-indigo-700">
                        {p.receiptNo}
                    </div>

                    {/* mobile info */}
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
                "text-right font-medium text-green-600",
            render: (p) =>
                `₹${p.amount.toLocaleString()}`,
        },
    ];

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl font-semibold">
                    Payments
                </h1>

                <button
                    onClick={() =>
                        router.push(
                            `/dashboard/payments/${id}/new`
                        )
                    }
                    className="
                        bg-indigo-600 text-white
                        px-4 py-2 rounded-md
                        inline-flex items-center gap-2
                        w-full sm:w-auto
                        justify-center
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

            {/* FOOTER INFO */}
            <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, data.length)} of{" "}
                {data.length} payments
            </div>
        </div>
    );
}
