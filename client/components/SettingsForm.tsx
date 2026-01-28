"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useEffect, useState } from "react"

import {
    settingsInfoSchema,
    SettingsInfoForm,
} from "@/lib/validators/companyInfo.schema"

import { CompanySettings } from "@/lib/types/company"
import { API_BASE_URL } from "@/lib/constants"
import { useUpdateSettingsInfo } from "@/lib/queries/settings"
import { handleApiError } from "@/lib/utils/getApiError"
import Spinner from "./Spinner"

function sanitizeDefaults(data: CompanySettings): SettingsInfoForm {
    return {
        ...data,
        email: data.email ?? undefined,
        gst: data.gst ?? undefined,
        town: data.town ?? undefined,
        district: data.district ?? undefined,
        state: data.state ?? undefined,
        pincode: data.pincode ?? undefined,
        bankName: data.bankName ?? undefined,
        accountNo: data.accountNo ?? undefined,
        ifsc: data.ifsc ?? undefined,
        upi: data.upi ?? undefined,
        phoneSecondary: data?.phoneSecondary ?? undefined,
        phoneTertiary: data?.phoneTertiary ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        qrCodeUrl: data.qrCodeUrl ?? undefined,
    }
}

export default function SettingsForm({
    defaultValues,
}: {
    defaultValues: CompanySettings
}) {
    const updateCompany = useUpdateSettingsInfo()

    const form = useForm<SettingsInfoForm>({
        resolver: zodResolver(settingsInfoSchema),
        defaultValues: sanitizeDefaults(defaultValues),
    })

    const { register, handleSubmit, reset, formState, setError } = form

    useEffect(() => {
        reset(sanitizeDefaults(defaultValues))
    }, [defaultValues, reset])

    /* ================= FILE STATE ================= */

    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [qrFile, setQrFile] = useState<File | null>(null)

    const [logoPreview, setLogoPreview] = useState<string | null>(
        defaultValues.logoUrl
            ? API_BASE_URL + defaultValues.logoUrl
            : null
    )

    const [qrPreview, setQrPreview] = useState<string | null>(
        defaultValues.qrCodeUrl
            ? API_BASE_URL + defaultValues.qrCodeUrl
            : null
    )

    const onSubmit = (data: SettingsInfoForm) => {
        const formData = new FormData()

        Object.entries(data).forEach(([k, v]) => {
            if (v !== undefined && v !== "") {
                formData.append(k, v)
            }
        })

        if (logoFile) formData.append("logo", logoFile)
        if (qrFile) formData.append("qrCode", qrFile)

        updateCompany.mutate(formData, {
            onSuccess: () => toast.success("Company settings updated"),
            onError: (e) => toast.error(handleApiError(e, { setError }).message),
        })
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="
                space-y-10
                bg-white
                p-4 sm:p-6 lg:p-8
                rounded-xl
                ring-1 ring-black/5
                max-w-5xl
                mx-auto
            "
        >
            {/* ================= IMAGES ================= */}

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-6
            ">
                <ImageUpload
                    label="Company Logo"
                    preview={logoPreview}
                    onChange={(file) => {
                        setLogoFile(file)
                        setLogoPreview(URL.createObjectURL(file))
                    }}
                />

                <ImageUpload
                    label="UPI QR Code"
                    preview={qrPreview}
                    onChange={(file) => {
                        setQrFile(file)
                        setQrPreview(URL.createObjectURL(file))
                    }}
                />
            </div>

            {/* ================= DETAILS ================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-4
                "
            >
                <Input label="Company Name" required {...register("name")} />
                <Input label="Primary Phone" required {...register("phone")} />
                <Input label="Email" {...register("email")} />

                <Input label="GST" {...register("gst")} />
                <Input label="Town" {...register("town")} />
                <Input label="District" {...register("district")} />

                <Input label="State" {...register("state")} />
                <Input label="Pincode" {...register("pincode")} />

                <Input label="Bank Name" {...register("bankName")} />
                <Input label="Account No" {...register("accountNo")} />
                <Input label="IFSC" {...register("ifsc")} />


                <Input label="UPI" {...register("upi")} />

                <Input label="Secondary Phone" {...register("phoneSecondary")} />
                <Input label="Aditional Phone" {...register("phoneTertiary")} />
            </div>

            {/* ================= ACTION ================= */}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={updateCompany.isPending}
                    className="
                        w-full sm:w-auto
                        px-6 py-2
                        rounded-md
                        text-white
                        transition
                        bg-indigo-600
                        hover:bg-indigo-700
                        disabled:bg-indigo-400
                    "
                >
                    {updateCompany.isPending ? <span className="flex items-center justify-center gap-2">
                        <Spinner size={18} /> Saving...
                    </span> : "Save Settings"}
                </button>
            </div>
        </form>
    )
}

/* ================= UI HELPERS ================= */

function ImageUpload({
    label,
    preview,
    onChange,
}: {
    label: string
    preview: string | null
    onChange: (file: File) => void
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
                {label}
            </label>

            <label
                className="
                    relative
                    group
                    cursor-pointer
                    rounded-xl
                    border-2 border-dashed
                    border-slate-300
                    hover:border-indigo-500
                    transition
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                    h-44
                    overflow-hidden
                "
            >
                {/* IMAGE PREVIEW */}
                {preview ? (
                    <>
                        <img
                            src={preview}
                            className="h-full w-full object-contain bg-white"
                        />

                        {/* OVERLAY */}
                        <div
                            className="
                                absolute inset-0
                                bg-black/40
                                opacity-0
                                group-hover:opacity-100
                                transition
                                flex
                                items-center
                                justify-center
                                text-white
                                text-sm
                                font-medium
                            "
                        >
                            Click to change
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-2 px-4">
                        <div className="text-indigo-600 text-2xl">📤</div>
                        <p className="text-sm font-medium text-slate-700">
                            upload {label.toLowerCase()}
                        </p>
                        <p className="text-xs text-slate-500">
                            PNG, JPG up to 2MB
                        </p>
                    </div>
                )}

                {/* REAL INPUT */}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            onChange(e.target.files[0])
                        }
                    }}
                />
            </label>
        </div>
    )
}

function Input({ label, required, ...props }: any) {
    return (
        <div>
            <label className="text-sm text-slate-600">
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>
            <input
                {...props}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
    )
}
