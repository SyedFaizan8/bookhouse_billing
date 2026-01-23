"use client"

import Breadcrumbs from "@/components/Breadcrumbs"
import DealerForm from "@/components/DealerForm"

export default function NewDealerPage() {
    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Companies", href: "/dashboard/companies" },
                    { label: "New" },
                ]}
            />

            <h1 className="text-xl font-semibold">Add Company</h1>

            <DealerForm mode="create" />
        </div>
    )
}
