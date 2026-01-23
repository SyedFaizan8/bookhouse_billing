"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Boxes } from "lucide-react";

import Breadcrumbs from "@/components/Breadcrumbs";
import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import TableLoader from "@/components/loaders/TableLoader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";

import { useInventory } from "@/lib/queries/inventory";
import { useClientPagination } from "@/lib/hooks/useClientPagination";

import { InventoryRow } from "@/lib/types/inventory";
import RowActions from "@/components/RowActions";

const PAGE_SIZE = 10;

export default function InventoryPage() {
    const router = useRouter();

    const { data = [], isLoading } = useInventory();

    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    /* ---------------- FILTER ---------------- */

    const filtered = useMemo(() => {
        if (!search) return data;

        const q = search.toLowerCase();

        return data.filter(
            (i: InventoryRow) =>
                i.title.toLowerCase().includes(q) ||
                i.dealer.name.toLowerCase().includes(q)
        );
    }, [data, search]);

    /* ---------------- PAGINATION ---------------- */

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination({
        data: filtered,
        pageSize: PAGE_SIZE,
    });

    /* ---------------- COLUMNS ---------------- */

    const columns: Column<InventoryRow>[] = [
        {
            key: "title",
            header: "Textbook",
            render: (i) => (
                <div>
                    <div className="font-medium">{i.title}</div>

                    {/* mobile extra info */}
                    <div className="text-xs text-slate-500 md:hidden">
                        Dealer: {i.dealer.name}
                    </div>
                </div>
            ),
        },
        {
            key: "dealer",
            header: "Dealer",
            className: "hidden md:table-cell",
            render: (i) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                            `/dashboard/dealers/${i.dealer.id}`
                        );
                    }}
                    className="text-indigo-600 hover:underline"
                >
                    {i.dealer.name}
                </button>
            ),
        },
        {
            key: "class",
            header: "Class",
            className: "hidden lg:table-cell",
            render: (i) => i.class,
        },
        {
            key: "price",
            header: "Price",
            render: (i) => (
                <span className="font-medium">
                    ₹{i.price.toLocaleString()}
                </span>
            ),
        },
        {
            key: "available",
            header: "Available",
            render: (i) => (
                <span
                    className={
                        i.available <= 0
                            ? "text-rose-600 font-medium"
                            : "text-emerald-700 font-medium"
                    }
                >
                    {i.available}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            render: (row) => (
                <RowActions
                    open={menuOpen === row.id}
                    onOpen={() => setMenuOpen(row.id)}
                    onClose={() => setMenuOpen(null)}
                    onEdit={() =>
                        router.push(
                            `/dashboard/inventory/${row.id}/edit`
                        )
                    }
                />
            ),
        },
    ];

    /* ---------------- STATES ---------------- */

    if (isLoading) return <TableLoader />;

    if (!data.length) {
        return (
            <EmptyState
                icon={Boxes}
                title="No inventory available"
                description="Stock will appear once supplies are recorded."
            />
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="space-y-6">

            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Inventory" },
                ]}
            />

            {/* SEARCH */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={18}
                    />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search textbook or dealer"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>
            </div>

            {/* TABLE */}
            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
            />

            {/* PAGINATION */}

            <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            <div className="text-xs text-slate-500 text-center sm:text-right">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(
                    page * PAGE_SIZE,
                    filtered.length
                )}{" "}
                of {filtered.length}
            </div>

        </div>
    );
}
