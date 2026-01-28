"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useUpdateUser, useCreateUser } from "@/lib/queries/users"
import { UserFormValues } from "@/lib/validators/user.schema"
import { handleApiError } from "@/lib/utils/getApiError"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function UserForm({
    defaultValues,
    mode = "create",
    userId,
}: {
    defaultValues?: Partial<UserFormValues>
    mode?: "create" | "edit"
    userId?: string
}) {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
        reset,
        setError
    } = useForm<UserFormValues>({ defaultValues })

    const createMutation = useCreateUser()
    const updateMutation = useUpdateUser(userId!)

    const isLoading =
        isSubmitting ||
        createMutation.isPending ||
        updateMutation.isPending

    const onSubmit = async (data: UserFormValues) => {
        if (mode === "create") {
            await createMutation.mutateAsync(data, {
                onSuccess: () => {
                    toast.success("User created successfully")
                    reset()
                },
                onError: (e) => toast.error(handleApiError(e, { setError }).message)
            })
        } else {
            const { password, ...safeData } = data
            await updateMutation.mutateAsync(safeData, {
                onSuccess: () => toast.success("User updated successfully"),
                onError: (e) => toast.error(handleApiError(e, { setError }).message)
            })
        }

    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl ring-1 ring-black/5"
        >
            <Input
                label="Full Name"
                required
                error={errors.name?.message}
                register={register("name", {
                    required: "Name is required",
                })}
            />

            <Input
                label="Mobile Number"
                required
                error={errors.phone?.message}
                register={register("phone", {
                    required: "Mobile number is required",
                    minLength: {
                        value: 10,
                        message: "Mobile must be at least 10 digits",
                    },
                })}
            />

            <Input
                label="Email"
                error={errors.email?.message}
                register={register("email", {
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                    },
                })}
            />

            <PasswordInput
                label={mode === "edit" ? "New Password (optional)" : "Password"}
                required={mode === "create"}
                error={errors.password?.message}
                register={register("password", {
                    ...(mode === "create" && {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                    }),
                })}
            />

            <Select
                label="Role"
                required
                error={errors.role?.message}
                register={register("role", {
                    required: "Role is required",
                })}
                options={[
                    { label: "Admin", value: "ADMIN" },
                    { label: "Staff", value: "STAFF" },
                ]}
            />

            <div className="md:col-span-2 flex justify-end">
                <button
                    disabled={isLoading}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {isLoading
                        ? "Saving..."
                        : mode === "create"
                            ? "Save User"
                            : "Update User"}
                </button>
            </div>
        </form>
    )
}

/* =========================
   INPUT
========================= */

const Input = ({
    label,
    register,
    type = "text",
    required = false,
    error,
}: any) => (
    <div>
        <label className="text-sm text-slate-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            {...register}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
    </div>
)

/* =========================
   SELECT
========================= */

const Select = ({
    label,
    register,
    options,
    required = false,
    error,
}: any) => (
    <div>
        <label className="text-sm text-slate-600">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            {...register}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        >
            <option value="">Select</option>
            {options.map((o: any) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
        {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
    </div>
)


/* =========================
   PASSWORD
========================= */

type Props = {
    label: string
    register: any
    required?: boolean
    error?: string
    placeholder?: string
}

export function PasswordInput({
    label,
    register,
    required,
    error,
    placeholder,
}: Props) {
    const [show, setShow] = useState(false)

    return (
        <div>
            <label className="text-sm text-slate-600">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative mt-1">
                <input
                    type={show ? "text" : "password"}
                    {...register}
                    placeholder={placeholder}
                    className="
                        w-full rounded-md border px-3 py-2 pr-10 text-sm
                        focus:ring-2 focus:ring-indigo-500
                    "
                />

                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="
                        absolute right-2 top-2.5
                        text-slate-400 hover:text-slate-600
                    "
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    )
}