"use client"

import Breadcrumbs from "@/components/Breadcrumbs"
import CustomerForm from "@/components/CustomerForm"

export default function NewCustomerPage() {

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Schools", href: "/dashboard/schools" },
                    { label: "New" },
                ]}
            />
            <h1 className="text-xl font-semibold">Add School</h1>
            <CustomerForm />
        </div >
    )
}
