"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import Breadcrumbs from "@/components/Breadcrumbs"
import { useDealerProfile } from "@/lib/queries/dealers"
import Link from "next/link"

export default function DealerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { id } = useParams<{ id: string }>()
    const pathname = usePathname()
    const { data, isLoading } = useDealerProfile(id)

    if (isLoading || !data) return null

    const nav = [
        { label: "Overview", href: `/dashboard/companies/${id}` },
        { label: "Supplies", href: `/dashboard/companies/${id}/supplies` },
        { label: "Returns", href: `/dashboard/companies/${id}/returns` },
        { label: "Payments", href: `/dashboard/companies/${id}/payments` },
        { label: "Statements", href: `/dashboard/companies/${id}/statements` },
        { label: "Edit Profile", href: `/dashboard/companies/${id}/edit` },
    ]

    return (
        <div className="space-y-6">
            {/* BREADCRUMBS */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Companies", href: "/dashboard/companies" },
                    { label: data.name },
                ]}
            />

            {/* PROFILE HEADER */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 ring-1 ring-black/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold">
                            {data.name}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Company
                        </p>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div className="mt-5 border-t pt-4">
                    <div
                        className="
                            flex gap-2
                            overflow-x-auto
                            scrollbar-hide
                            sm:flex-wrap
                        "
                    >
                        {nav.map((item) => {
                            const active = pathname === item.href
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
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 ring-1 ring-black/5">
                {children}
            </div>
        </div>
    )
}
