"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar } from "lucide-react"
import { toast } from "sonner"

import Breadcrumbs from "@/components/Breadcrumbs"
import { useCreateAcademicYear } from "@/lib/queries/academicYear"
import { useRouter } from "next/navigation"
import { handleApiError } from "@/lib/utils/getApiError"
import Spinner from "@/components/Spinner"

const schema = z
    .object({
        startDate: z.string().date(),
        endDate: z.string().date(),
    })
    .refine(
        (data) => new Date(data.startDate) < new Date(data.endDate),
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    )

type FormData = z.infer<typeof schema>

export default function CreateAcademicYearPage() {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const router = useRouter()
    const mutation = useCreateAcademicYear()

    // Auto-suggest March → Feb
    useEffect(() => {
        const now = new Date()
        const year = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1

        form.setValue("startDate", `${year}-03-01`)
        form.setValue("endDate", `${year + 1}-02-28`)
    }, [form])

    const onSubmit = (data: FormData) => {
        mutation.mutate(data, {
            onSuccess: () => {
                toast.success("Academic year created and activated")
                router.replace('/dashboard/year')
            },
            onError: (e) => toast.error(handleApiError(e).message)
        })
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Academic Years", href: "/dashboard/year" },
                    { label: "Create" },
                ]}
            />

            <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                        <Calendar className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Create Academic Year</h1>
                        <p className="text-sm text-slate-500">
                            Academic years usually run from March to February
                        </p>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                {...form.register("startDate")}
                                className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            />
                            {form.formState.errors.startDate && (
                                <p className="text-xs text-rose-600 mt-1">
                                    {form.formState.errors.startDate.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                {...form.register("endDate")}
                                className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            />
                            {form.formState.errors.endDate && (
                                <p className="text-xs text-rose-600 mt-1">
                                    {form.formState.errors.endDate.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                        <strong>What will happen:</strong>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>Previous academic year (if any) will be closed automatically</li>
                            <li>This year will become the active year for all billing</li>
                            <li>Invoice numbering will restart for this year</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => history.back()}
                            className="rounded-md border px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={mutation.isPending}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {mutation.isPending ? <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} /> Creating...
                            </span> : "Create Academic Year"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
