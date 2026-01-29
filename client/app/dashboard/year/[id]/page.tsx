"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar } from "lucide-react"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"

import Breadcrumbs from "@/components/Breadcrumbs"
import Spinner from "@/components/Spinner"
import { handleApiError } from "@/lib/utils/getApiError"
import {
    useAcademicYear,
    useUpdateAcademicYear,
} from "@/lib/queries/academicYear"
import PageLoader from "@/components/loaders/PageLoader"
import { useAuthUser } from "@/lib/queries/auth"

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

export default function EditAcademicYearPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const { data, isLoading } = useAcademicYear(id)
    const mutation = useUpdateAcademicYear(id)

    const { data: user, isLoading: authLoading } = useAuthUser();

    useEffect(() => {
        if (!isLoading && user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!data) return

        form.reset({
            startDate: data.startDate.slice(0, 10),
            endDate: data.endDate.slice(0, 10),
        })
    }, [data, form])

    const onSubmit = (values: FormData) => {
        mutation.mutate(values, {
            onSuccess: () => {
                toast.success("Academic year updated")
                router.replace("/dashboard/year")
            },
            onError: (e) =>
                toast.error(handleApiError(e).message),
        })
    }

    if (isLoading || authLoading || !user || user.role !== "ADMIN") return <PageLoader />;

    return (
        <div className="space-y-6 max-w-2xl">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Academic Years", href: "/dashboard/year" },
                    { label: "Edit" },
                ]}
            />

            <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                        <Calendar className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">
                            Edit Academic Year
                        </h1>
                        <p className="text-sm text-slate-500">
                            Update academic year dates. Overlapping is not allowed.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                >
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
                        <strong>Note:</strong>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>Dates can be corrected anytime</li>
                            <li>Academic years cannot overlap</li>
                            <li>Name will auto-update based on dates</li>
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
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Spinner size={18} /> Updating...
                                </span>
                            ) : (
                                "Update Academic Year"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
