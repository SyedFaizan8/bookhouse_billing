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
import { useAuthUser } from "@/lib/queries/auth"
import PageLoader from "@/components/loaders/PageLoader"

import { Controller } from "react-hook-form";
import { DatePicker } from "@/components/DatePicker";


const schema = z
    .object({
        startDate: z.date("Please Select the date"),
        endDate: z.date("Please Select the date"),
    })
    .refine(
        (data) => data.startDate < data.endDate,
        {
            message: "End date must be after start date",
            path: ["endDate"],
        }
    )

type FormData = z.infer<typeof schema>

export default function CreateAcademicYearPage() {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            startDate: undefined,
            endDate: undefined,
        },
    });


    const router = useRouter()
    const mutation = useCreateAcademicYear()

    const { data: user, isLoading } = useAuthUser();

    useEffect(() => {
        if (!isLoading && user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router]);

    const onSubmit = (data: FormData) => {
        mutation.mutate({
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
        }, {
            onSuccess: () => {
                toast.success("Academic year created and activated")
                router.replace('/dashboard/year')
            },
            onError: (e) => toast.error(handleApiError(e).message)
        })
    }

    if (isLoading || !user || user.role !== "ADMIN") return <PageLoader />;

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

                            <Controller
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Start date"
                                    />
                                )}
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

                            <Controller
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="End date"
                                    />
                                )}
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
