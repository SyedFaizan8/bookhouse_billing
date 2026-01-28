"use client"

import { useParams } from "next/navigation"
import FormLoader from "@/components/loaders/FormLoader"
import DealerForm from "@/components/CompanyForm"
import { useCompanyProfile } from "@/lib/queries/company"

export default function EditDealerPage() {
    const { id } = useParams<{ id: string }>()
    const { data, isLoading, error } = useCompanyProfile(id)

    if (isLoading) return <FormLoader />

    if (!data) return null

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Edit Company</h1>

            <DealerForm
                mode="edit"
                companyId={id}
                defaultValues={data}
            />
        </div>
    )
}
