"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import Breadcrumbs from "@/components/Breadcrumbs";
import ResponsiveTable, { Column } from "@/components/ResponsiveTable";
import Pagination from "@/components/Pagination";

import { School } from "@/lib/types/customer";
import { useSorting } from "@/lib/hooks/useSorting";
import { useClientPagination } from "@/lib/hooks/useClientPagination";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { sortData } from "@/lib/utils/sortData";
import { useSchoolsInfinite } from "@/lib/queries/schools";

const PAGE_SIZE = 10;

export default function CustomersPage() {
    const router = useRouter();

    const searchRef = useRef<HTMLInputElement>(null);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search);

    useEffect(() => {
        searchRef.current?.focus();
        setPage(1)
    }, [debouncedSearch]);


    const { sortBy, order, toggleSort } =
        useSorting<"name" | "addedOn">("addedOn");

    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
    } = useSchoolsInfinite(sortBy, order, debouncedSearch);


    // flatten server pages
    const allRows: School[] = useMemo(() => {
        const raw = data?.pages.flatMap((p) => p.items) ?? [];
        return raw.length <= 500 ? sortData(raw, sortBy, order) : raw;
    }, [data, sortBy, order]);

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination<School>({
        data: allRows,
        pageSize: PAGE_SIZE,
        fetchNext: fetchNextPage,
        hasNextPage,
    });

    const sortHeader = (label: string, key: typeof sortBy) => (
        <button
            onClick={() => toggleSort(key)}
            className="flex items-center gap-1"
        >
            {label}
            {sortBy === key && (order === "asc" ? "↑" : "↓")}
        </button>
    );

    const columns: Column<School>[] = [
        {
            key: "#",
            header: "#",
            render: (_, index) => (
                <div>
                    <div className="font-medium text-xs text-left">{(page - 1) * PAGE_SIZE + index! + 1}</div>
                </div>
            ),
        },
        {
            key: "name",
            header: sortHeader("Name", "name"),
            render: (c) => (
                <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500 md:hidden">
                        {c.phone}
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            className: "hidden md:table-cell",
            render: (c) => c.phone,
        },
        {
            key: "addedOn",
            header: sortHeader("Added On", "addedOn"),
            className: "hidden lg:table-cell text-slate-500",
            render: (c) =>
                new Date(c.addedOn).toLocaleDateString("en-IN"),
        },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Schools" },
                ]}
            />

            {/* SEARCH */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={18}
                    />
                    <input
                        ref={searchRef}
                        className="w-full pl-10 pr-3 py-2 border rounded-md"
                        placeholder="Search name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Link
                    href="/dashboard/schools/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add School
                </Link>
            </div>

            <ResponsiveTable<School>
                data={pageData}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(row) => {
                    router.push(`/dashboard/schools/${row.id}`);
                }}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                onPageChange={setPage}
            />

            {/* <div className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, allRows.length)} of{" "}
                {allRows.length}
            </div> */}
        </div>
    );
}
