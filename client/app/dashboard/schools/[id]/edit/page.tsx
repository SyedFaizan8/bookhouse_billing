"use client"

import { useParams } from "next/navigation"
import CustomerForm from "@/components/CustomerForm"
import FormLoader from "@/components/loaders/FormLoader"
import { School } from "lucide-react"
import EmptyState from "@/components/EmptyState"
import { useSchoolEdit } from "@/lib/queries/schools"

export default function EditCustomerPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading } = useSchoolEdit(id)

    if (isLoading) return <FormLoader />

    if (!data) return (
        <EmptyState
            icon={School}
            title="No customers yet"
            description="Add your first school to start billing"
            actionLabel="Add Customer"
            actionHref="/dashboard/schools/new"
        />
    )

    return (
        <div className="space-y-6">

            <h1 className="text-xl font-semibold">Edit School</h1>

            <CustomerForm
                mode="edit"
                customerId={id}
                defaultValues={{
                    ...data,
                    // null → ""
                    email: data.email ?? "",
                    contactPerson: data.contactPerson ?? "",
                    street: data.street ?? "",
                    town: data.town ?? "",
                    district: data.district ?? "",
                    state: data.state ?? "",
                    pincode: data.pincode ?? "",
                    gst: data.gst ?? "",
                    board: data.board ?? "",
                    medium: data.medium ?? "",
                }}
            />
        </div>
    )
}
