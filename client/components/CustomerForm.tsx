"use client"

import { useCreateCustomer, useUpdateCustomer } from "@/lib/queries/customers"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Spinner from "@/components/Spinner"
import { customerFormSchema, CustomerFormValues } from "@/lib/validators/customer.schema"
import { useEffect } from "react"

export default function CustomerForm({
    defaultValues,
    mode = "create",
    customerId,
}: {
    defaultValues?: Partial<CustomerFormValues>
    mode?: "create" | "edit"
    customerId?: string
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormValues>({ resolver: zodResolver(customerFormSchema), defaultValues })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    const createMutation = useCreateCustomer()
    const updateMutation =
        mode === "edit" && customerId
            ? useUpdateCustomer(customerId)
            : null

    const isLoading =
        isSubmitting ||
        createMutation.isPending ||
        updateMutation?.isPending

    const onSubmit = async (data: CustomerFormValues) => {
        if (mode === "edit" && updateMutation) {
            updateMutation.mutate(data)
        } else {
            createMutation.mutate(data)
            reset()
        }
    }

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl ring-1 ring-black/5"
        >
            <Input
                label="School Name"
                required
                error={errors.name?.message}
                register={register("name")}
            />

            <Input
                label="Phone Number"
                required
                error={errors.phone?.message}
                register={register("phone")}
            />

            <Input
                label="Email"
                error={errors.email?.message}
                register={register("email")}
            />

            <Input
                label="Contact Person"
                register={register("contactPerson")}
            />

            <Textarea
                label="Street / Area"
                error={errors.street?.message}
                register={register("street")}
                className="md:col-span-2"
            />

            <Input
                label="Town"
                register={register("town")}
            />

            <Input
                label="District"
                error={errors.district?.message}
                register={register("district")}
            />

            <Input
                label="State"
                error={errors.state?.message}
                register={register("state")}
            />

            <Input
                label="Pincode"
                error={errors.pincode?.message}
                register={register("pincode")}
            />

            <Input
                label="GST Number"
                register={register("gst")}
            />

            <Input
                label="Board"
                register={register("board")}
            />

            <Select
                label="Medium"
                register={register("medium")}
                options={["English", "Kannada", "Hindi", "Other"]}
            />

            <div className="md:col-span-2 flex justify-end">
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white
                            ${isLoading
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        }`}             >
                    {isLoading && <Spinner />}
                    {isLoading
                        ? mode === "edit"
                            ? "Updating..."
                            : "Saving..."
                        : mode === "edit"
                            ? "Update Customer"
                            : "Save Customer"}
                </button>
            </div>
        </form>
    )
}
/* helpers */

const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label className="text-sm text-slate-600">
        {text}
        {required && <span className="ml-1 text-red-500">*</span>}
    </label>
)

const Input = ({ label, register, error, type = "text", required }: any) => (
    <div>
        <Label text={label} required={required} />
        <input
            type={type}
            {...register}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none
                ${error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-indigo-500"
                }`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
)

const Textarea = ({ label, register, error, className = "", required }: any) => (
    <div className={className}>
        <Label text={label} required={required} />
        <textarea
            {...register}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none resize-none
        ${error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:ring-indigo-500"
                }`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const Select = ({ label, register, options }: any) => (
    <div>
        <Label text={label} />
        <select
            {...register}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
            <option value="">Select</option>
            {options.map((o: string) => (
                <option key={o}>{o}</option>
            ))}
        </select>
    </div>
)
