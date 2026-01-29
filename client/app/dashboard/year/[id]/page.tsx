"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import Spinner from "@/components/Spinner";
import PageLoader from "@/components/loaders/PageLoader";
import { DatePicker } from "@/components/DatePicker";

import { handleApiError } from "@/lib/utils/getApiError";
import {
    useAcademicYear,
    useUpdateAcademicYear,
} from "@/lib/queries/academicYear";
import { useAuthUser } from "@/lib/queries/auth";

/* ======================================================
   VALIDATION
====================================================== */

const schema = z
    .object({
        startDate: z.date(),
        endDate: z.date(),
    })
    .refine((data) => data.startDate < data.endDate, {
        message: "End date must be after start date",
        path: ["endDate"],
    });

type FormData = z.infer<typeof schema>;

/* ======================================================
   PAGE
====================================================== */

export default function EditAcademicYearPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            startDate: undefined,
            endDate: undefined,
        },
    });

    const { data, isLoading } = useAcademicYear(id);
    const mutation = useUpdateAcademicYear(id);

    const { data: user, isLoading: authLoading } = useAuthUser();

    /* ======================================================
       ACCESS CONTROL
    ===================================================== */

    useEffect(() => {
        if (!authLoading && user && user.role !== "ADMIN") {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);

    /* ======================================================
       LOAD EXISTING DATA
    ===================================================== */

    useEffect(() => {
        if (!data) return;

        form.reset({
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        });
    }, [data, form]);

    /* ======================================================
       SUBMIT
    ===================================================== */

    const onSubmit = (values: FormData) => {
        mutation.mutate(
            {
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
            },
            {
                onSuccess: () => {
                    toast.success("Academic year updated successfully");
                    router.replace("/dashboard/year");
                },
                onError: (e) =>
                    toast.error(handleApiError(e).message),
            }
        );
    };

    if (
        isLoading ||
        authLoading ||
        !user ||
        user.role !== "ADMIN"
    )
        return <PageLoader />;

    /* ======================================================
       UI
    ===================================================== */

    return (
        <div className="space-y-6 max-w-2xl">

            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Academic Years", href: "/dashboard/year" },
                    { label: "Edit" },
                ]}
            />

            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">

                {/* HEADER */}
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                        <Calendar className="text-indigo-600" size={20} />
                    </div>

                    <div>
                        <h1 className="text-lg font-semibold">
                            Edit Academic Year
                        </h1>
                        <p className="text-sm text-slate-500">
                            Modify dates. Overlapping academic years are not allowed.
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* START DATE */}
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
                                        placeholder="Select start date"
                                    />
                                )}
                            />

                            {form.formState.errors.startDate && (
                                <p className="text-xs text-rose-600 mt-1">
                                    {form.formState.errors.startDate.message}
                                </p>
                            )}
                        </div>

                        {/* END DATE */}
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
                                        placeholder="Select end date"
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

                    {/* INFO BOX */}
                    <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                        <strong>Important:</strong>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>You can correct dates anytime</li>
                            <li>Academic years cannot overlap</li>
                            <li>Name auto-updates from selected dates</li>
                        </ul>
                    </div>

                    {/* ACTIONS */}
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
    );
}
