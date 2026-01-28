"use client"

import Breadcrumbs from "@/components/Breadcrumbs"
import FormLoader from "@/components/loaders/FormLoader"
import SettingsForm from "@/components/SettingsForm"
import { useAuthUser } from "@/lib/queries/auth"
import { useSettingsInfo } from "@/lib/queries/settings"

export default function SettingsPage() {

    const { data, isLoading } = useSettingsInfo()

    const { data: user } = useAuthUser()

    if (isLoading) return <FormLoader />

    if (user?.role !== "ADMIN") {
        return (
            <div className="text-slate-600">
                You are not authorized to view this page.
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Settings" },
                ]}
            />

            <h1 className="text-xl font-semibold text-slate-800">
                Company Settings
            </h1>

            <SettingsForm
                defaultValues={{
                    name: data?.name ?? "",
                    phone: data?.phone ?? "",
                    email: data?.email ?? "",
                    gst: data?.gst ?? "",
                    town: data?.town ?? "",
                    district: data?.district ?? "",
                    state: data?.state ?? "",
                    pincode: data?.pincode ?? "",
                    bankName: data?.bankName ?? "",
                    accountNo: data?.accountNo ?? "",
                    ifsc: data?.ifsc ?? "",
                    upi: data?.upi ?? "",
                    phoneSecondary: data?.phoneSecondary ?? "",
                    phoneTertiary: data?.phoneTertiary ?? "",
                    logoUrl: data?.logoUrl ?? "",
                    qrCodeUrl: data?.qrCodeUrl ?? ""
                }}
            />
        </div>
    )
}
