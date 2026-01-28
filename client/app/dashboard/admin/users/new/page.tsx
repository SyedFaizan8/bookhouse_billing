"use client"

import Breadcrumbs from "@/components/Breadcrumbs"
import UserForm from "@/components/UserForm"

export default function NewUserPage() {

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Users", href: "/dashboard/admin/users" },
                    { label: "New" },
                ]}
            />

            <h1 className="text-xl font-semibold">Add User</h1>

            <UserForm mode="create" />
        </div>
    )
}
