"use client";

import { useParams } from "next/navigation";
import PageLoader from "@/components/loaders/PageLoader";
import EmptyState from "@/components/EmptyState";
import { School } from "lucide-react";
import { useSchoolProfile } from "@/lib/queries/schools";

export default function DealerProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useSchoolProfile(id);

    if (isLoading) return <PageLoader />;

    if (!data)
        return (
            <EmptyState
                icon={School}
                title="School not found"
                description="Add your first school to start billing"
                actionLabel="Add School"
                actionHref="/dashboard/schools/new"
            />
        );

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* PAGE TITLE */}
            <h1 className="text-lg sm:text-xl font-semibold">Overview</h1>

            {/* PROFILE CARD */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">

                {/* HEADER */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-base sm:text-xl font-semibold truncate">
                            {data.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            School
                        </p>
                    </div>

                    {data.active && (
                        <Badge>Active</Badge>
                    )}
                </div>

                {/* INFO GRID */}
                <div className="border-t px-4 py-4 sm:px-6 sm:py-5">
                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-3
                            gap-3 sm:gap-4
                            text-sm
                        "
                    >
                        <Info label="Phone" value={data.phone} />
                        {data.email && <Info label="Email" value={data.email} />}
                        {data.medium && <Info label="Medium" value={data.medium} />}
                        {data.board && <Info label="Board" value={data.board} />}
                        {data.contactPerson && (<Info label="Contact Person" value={data.contactPerson} />)}
                        {data.gst && <Info label="GST Number" value={data.gst} />}
                        {data.town && <Info label="Town" value={data.town} />}
                        {data.district && <Info label="District" value={data.district} />}
                        {data.state && <Info label="State" value={data.state} />}
                        {data.pincode && <Info label="Pincode" value={data.pincode} />}
                        {data.street && <Info label="Street" value={data.street} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-2 sm:px-4 sm:py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 font-medium break-words text-sm sm:text-base">
                {value}
            </p>
        </div>
    );
}

function Badge({ children }: { children: string }) {
    return (
        <span className="self-start sm:self-auto rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {children}
        </span>
    );
}
