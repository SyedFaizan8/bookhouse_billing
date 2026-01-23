"use client"

import { useParams } from "next/navigation"
import FormLoader from "@/components/loaders/FormLoader"
import EmptyState from "@/components/EmptyState"
import { LibraryBig } from "lucide-react"
import { useDealerEdit } from "@/lib/queries/dealers"
import DealerForm from "@/components/DealerForm"

export default function EditDealerPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, error } = useDealerEdit(id)

    if (isLoading) return <FormLoader />
    console.log()

    if (!data) return (
        <EmptyState
            icon={LibraryBig}
            title="No dealers found"
            description="Add publishers or book suppliers."
            actionLabel="Add Company"
            actionHref="/dashboard/companies/new"
        />
    )

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Edit Company</h1>

            <DealerForm
                mode="edit"
                dealerId={id}
                defaultValues={data}
            />
        </div>
    )
}
