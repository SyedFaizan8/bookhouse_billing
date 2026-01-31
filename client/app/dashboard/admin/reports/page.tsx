"use client";

import { useDashboardOverview } from "@/lib/queries/dashboard";
import {
    School,
    LibraryBig,
    IndianRupee,
    FileText,
    Bookmark,
    Users,
} from "lucide-react";
import { InvoicePaymentChart } from "@/components/charts/InvoicePaymentChart";
import DashboardLoading from "@/components/loaders/DashboardLoader";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { formatINR } from "@/lib/utils/formatters";
import DocumentsDashboard from "@/components/DocumentsDashboard";

export default function DashboardPage() {

    const { data, isLoading, } = useDashboardOverview();

    if (isLoading) return <DashboardLoading />;

    if (!data) {
        return (
            <EmptyState
                icon={Bookmark}
                title="No data found"
                description="Create Invoices or Payments to see the report or Academic Year is not created."
            />
        )
    }

    const items = [
        {
            name: "Schools",
            count: data.cards.schools,
            isMoney: false,
            icon: School,
            accent: "bg-indigo-50 text-indigo-600",
            url: '/dashboard/schools',
            span: 'col-span-2'
        },
        {
            name: "Companies",
            count: data.cards.companies,
            isMoney: false,
            icon: LibraryBig,
            accent: "bg-emerald-50 text-emerald-600",
            url: '/dashboard/companies',
            span: 'col-span-2'
        },
        {
            name: "Users",
            count: data.cards.users,
            isMoney: false,
            icon: Users,
            accent: "bg-indigo-50 text-indigo-600",
            url: '/dashboard/admin/users',
            span: 'col-span-2'
        },
        {
            name: "Total Sales",
            count: data.cards.totalSales,
            isMoney: true,
            icon: FileText,
            accent: "bg-sky-50 text-sky-600",
            url: '#',
            span: 'col-span-3'
        },
        {
            name: "Outstanding (Receivable)",
            count: data.cards.outstanding,
            isMoney: true,
            icon: IndianRupee,
            accent: "bg-amber-50 text-amber-600",
            url: '#',
            span: 'col-span-3'
        },
    ]

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    Academic Year {data.academicYear}
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 mb-6">
                {items.map((item, i) => {
                    const Icon = item.icon

                    return (
                        <Link
                            key={i}
                            href={item.url}
                            className={`${item.span}
                                    bg-white rounded-md p-5
                                    shadow-sm hover:shadow-md transition
                                    cursor-pointer hover:font-bold col-span-2
                                `}
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-3xl font-semibold text-slate-900 flex items-baseline gap-1">
                                        {item.isMoney && <span className="text-xl font-medium text-slate-500">₹</span>}
                                        <span>{item.isMoney ? formatINR((item.count)) : item.count}</span>
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.name}
                                    </p>
                                </div>

                                <div
                                    className={`
                                        h-11 w-11 flex items-center justify-center
                                        rounded-full ${item.accent}
                                    `}
                                >
                                    <Icon size={22} />
                                </div>

                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* CHART */}
            <InvoicePaymentChart data={data.monthly} />

            {/* Table */}
            <DocumentsDashboard />
        </div>
    );
}
