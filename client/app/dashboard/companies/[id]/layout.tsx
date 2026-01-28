"use client";

import { useParams, usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { useCompanyProfile } from "@/lib/queries/company";

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { id } = useParams<{ id: string }>();
    const pathname = usePathname();
    const { data, isLoading } = useCompanyProfile(id);

    if (isLoading || !data) return null;

    const nav = [
        { label: "Overview", href: `/dashboard/companies/${id}` },
        { label: "Invoices", href: `/dashboard/companies/${id}/invoices` },
        { label: "Credit Note", href: `/dashboard/companies/${id}/credit` },
        { label: "Payments", href: `/dashboard/companies/${id}/payments` },
        { label: "Statement", href: `/dashboard/companies/${id}/statement` },
        { label: "Edit Profile", href: `/dashboard/companies/${id}/edit` },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* BREADCRUMBS */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Companies", href: "/dashboard/companies" },
                    { label: data.name },
                ]}
            />

            {/* PROFILE HEADER */}
            <div className="space-y-4">

                {/* PROFILE CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-black/5 overflow-hidden">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 px-5 py-5 sm:px-6">

                        {/* TITLE */}
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-semibold truncate">
                                {data.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Company profile
                            </p>
                        </div>
                    </div>

                    {/* TAB NAV */}
                    <div className="border-t bg-white/70 backdrop-blur">

                        <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                            {nav.map((item) => {
                                const active = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            shrink-0
                                            flex items-center gap-2
                                            rounded-full
                                            px-4 py-2
                                            text-sm
                                            font-medium
                                            transition-all
                                            whitespace-nowrap
                                            ${active
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* PAGE CONTENT */}
                <div className="rounded-2xl bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
