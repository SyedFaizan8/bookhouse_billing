"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { CompanyFormValues, companySchema } from "@/lib/validators/dealer.schema"
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/company"
import { AxiosError, isAxiosError } from "axios"
import { handleApiError } from "@/lib/utils/getApiError"

export default function CompanyForm({
    defaultValues,
    mode = "create",
    companyId,
}: {
    defaultValues?: Partial<CompanyFormValues>
    mode?: "create" | "edit"
    companyId?: string
}) {

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues,
    })

    const createMutation = useCreateCompany()
    const updateMutation =
        mode === "edit" && companyId
            ? useUpdateCompany(companyId)
            : null

    const isLoading =
        isSubmitting ||
        createMutation.isPending ||
        updateMutation?.isPending

    const onSubmit = async (data: CompanyFormValues) => {

        if (mode === "edit" && updateMutation) {
            await updateMutation.mutateAsync(data, {
                onSuccess: () => toast.success("Company updated successfully"),
                onError: (e) => toast.error(handleApiError(e, { setError }).message)
            })
        } else {
            await createMutation.mutateAsync(data, {
                onSuccess: () => {
                    toast.success("School created successfully")
                    reset()
                },
                onError: (e) => toast.error(handleApiError(e, { setError }).message)
            })
        }
    }


    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl ring-1 ring-black/5"
        >
            {/* BASIC */}
            <Input label="Company Name" required error={errors.name?.message}
                register={register("name")} />

            <Input label="Phone Number" required error={errors.phone?.message}
                register={register("phone")} />

            <Input label="Email" error={errors.email?.message}
                register={register("email")} />

            {/* ADDRESS */}
            <Textarea
                label="Street / Area"
                className="md:col-span-2"
                error={errors.street?.message}
                register={register("street")}
            />

            <Input label="Town" register={register("town")} />
            <Input label="District" error={errors.district?.message}
                register={register("district")} />

            <Input label="State" error={errors.state?.message}
                register={register("state")} />

            <Input label="Pincode" error={errors.pincode?.message}
                register={register("pincode")} />

            {/* TAX */}
            <Input label="GST Number" register={register("gst")} />

            {/* BANK */}
            <Input label="Bank Name" register={register("bankName")} />
            <Input label="Account Number" register={register("accountNo")} />
            <Input label="IFSC Code" register={register("ifsc")} />

            {/* SUBMIT */}
            <div className="md:col-span-2 flex justify-end">
                <button
                    disabled={isLoading}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {isLoading
                        ? "Saving..."
                        : mode === "create"
                            ? "Save Dealer"
                            : "Update Dealer"}
                </button>
            </div>
        </form>
    )
}

/* ---------------- helpers ---------------- */

const Label = ({ label, required }: { label: string; required?: boolean }) => (
    <label className="text-sm text-slate-600">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
)

const Input = ({
    label,
    register,
    type = "text",
    error,
    required,
}: any) => (
    <div>
        <Label label={label} required={required} />
        <input
            type={type}
            {...register}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none
        ${error ? "border-rose-500" : "border-slate-300"}
        focus:ring-2 focus:ring-indigo-500`}
        />
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
)

const Textarea = ({
    label,
    register,
    className = "",
    error,
    required,
}: any) => (
    <div className={className}>
        <Label label={label} required={required} />
        <textarea
            {...register}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none
        ${error ? "border-rose-500" : "border-slate-300"}
        focus:ring-2 focus:ring-indigo-500`}
        />
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
)
