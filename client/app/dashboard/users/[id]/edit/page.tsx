"use client"

import { useParams } from "next/navigation"
import Breadcrumbs from "@/components/Breadcrumbs"
import UserForm from "@/components/UserForm"
import FormLoader from "@/components/loaders/FormLoader"
import { useUserEdit } from "@/lib/queries/users"

export default function EditUserPage() {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading, isError } = useUserEdit(id)

    if (isLoading) return <FormLoader />
    if (isError || !data) return <div>User not found</div>

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Users", href: "/dashboard/users" },
                    { label: "Edit" },
                ]}
            />

            <h1 className="text-xl font-semibold">Edit User</h1>

            <UserForm
                mode="edit"
                userId={id}
                defaultValues={{
                    name: data.name,
                    phone: data.phone,
                    email: data.email ?? "",
                    role: data.role,
                }}
            />
        </div>
    )
}
