"use client"

import { useParams } from "next/navigation"
import PageLoader from "@/components/loaders/PageLoader"
import EmptyState from "@/components/EmptyState"
import { LibraryBig } from "lucide-react"
import { useCompanyProfile } from "@/lib/queries/company"

export default function DealerProfilePage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading } = useCompanyProfile(id)

    if (isLoading) return null
    if (!data) return null


    if (isLoading) return <PageLoader />
    if (!data) return <EmptyState
        icon={LibraryBig}
        title="No companies found"
        description="Add publishers or book suppliers."
        actionLabel="Add Company"
        actionHref="/dashboard/companies/new"
    />

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Overview</h1>


            {/* PROFILE CARD */}
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold">{data.name}</h1>
                        <p className="text-sm text-slate-500">Company</p>
                    </div>

                    <Badge>Active</Badge>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <Info label="Phone" value={data.phone} />
                    {data.email && <Info label="Email" value={data.email} />}

                    {data.gst && <Info label="GST Number" value={data.gst} />}

                    {data.town && <Info label="Town" value={data.town} />}
                    {data.district && <Info label="District" value={data.district} />}
                    {data.state && <Info label="State" value={data.state} />}
                    {data.pincode && <Info label="Pincode" value={data.pincode} />}

                    {data.street && <Info label="Street" value={data.street} />}
                </div>
            </div>

            {/* BANK DETAILS */}
            {(data.bankName || data.accountNo) && (
                <div className="rounded-xl bg-white p-6 ring-1 ring-black/5">
                    <h3 className="mb-4 font-semibold">Bank Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {data.bankName && <Info label="Bank" value={data.bankName} />}
                        {data.accountNo && <Info label="Account No" value={data.accountNo} />}
                        {data.ifsc && <Info label="IFSC" value={data.ifsc} />}
                    </div>
                </div>
            )}
        </div>
    )
}


function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-medium break-words">{value}</p>
        </div>
    )
}

function Badge({ children }: { children: string }) {
    return (
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {children}
        </span>
    )
}