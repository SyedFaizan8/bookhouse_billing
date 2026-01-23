"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { useCreateAcademicYear } from "@/lib/queries/academicYear"

const schema = z.object({
    startDate: z.string().date(),
    endDate: z.string().date(),
})

type FormData = z.infer<typeof schema>

export default function CreateAcademicYearPage() {
    const form = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const mutation = useCreateAcademicYear()

    return (
        <form
            onSubmit={form.handleSubmit((data) =>
                mutation.mutate(data, {
                    onSuccess: () => toast.success("Academic year created"),
                    onError: (e: any) =>
                        toast.error(e.response?.data?.message || "Failed"),
                })
            )}
            className="max-w-md space-y-4"
        >
            <input type="date" {...form.register("startDate")} className="border p-2 w-full rounded" />
            <input type="date" {...form.register("endDate")} className="border p-2 w-full rounded" />

            <button className="bg-indigo-600 text-white px-4 py-2 rounded">
                Create Academic Year
            </button>
        </form>
    )
}
