"use client"

import Breadcrumbs from "@/components/Breadcrumbs"
import CompanyForm from "@/components/CompanyForm"

export default function NewCompanyPage() {
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

            <CompanyForm mode="create" />
        </div>
    )
}
