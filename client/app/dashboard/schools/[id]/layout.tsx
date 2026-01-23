"use client";

import { useParams, usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { useCustomerProfile } from "@/lib/queries/customers";

export default function DealerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { id } = useParams<{ id: string }>();
    const pathname = usePathname();
    const { data, isLoading } = useCustomerProfile(id);

    if (isLoading || !data) return null;

    const nav = [
        { label: "Overview", href: `/dashboard/schools/${id}` },
        { label: "Issued", href: `/dashboard/schools/${id}/issued` },
        { label: "Returns", href: `/dashboard/schools/${id}/returns` },
        { label: "Payments", href: `/dashboard/schools/${id}/payments` },
        { label: "Statement", href: `/dashboard/schools/${id}/statement` },
        { label: "Edit Profile", href: `/dashboard/schools/${id}/edit` },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* BREADCRUMBS */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "schools", href: "/dashboard/schools" },
                    { label: data.name },
                ]}
            />

            {/* PROFILE HEADER */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">

                {/* HEADER TOP */}
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                    <h1 className="text-base sm:text-xl font-semibold truncate">
                        {data.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        School profile
                    </p>
                </div>

                {/* MOBILE TABS */}
                <div className="border-t bg-slate-50 sm:hidden">
                    <div className="flex overflow-x-auto gap-2 px-3 py-2 scrollbar-hide">
                        {nav.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        shrink-0
                                        rounded-full
                                        px-4 py-1.5
                                        text-sm font-medium
                                        transition
                                        ${active
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-slate-600"
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* DESKTOP TABS */}
                <div className="hidden sm:block border-t">
                    <div className="flex flex-wrap gap-2 px-6 py-3">
                        {nav.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                            rounded-full
                                            px-4 py-1.5
                                            text-sm font-medium
                                            transition
                                            ${active
                                            ? "bg-indigo-50 text-indigo-700"
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
            <div className="rounded-2xl bg-white p-4 sm:p-6 ring-1 ring-black/5">
                {children}
            </div>
        </div>
    );
}
