"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Spinner from "@/components/Spinner";
import { UpdateTextbookInput, updateTextbookSchema } from "@/lib/validators/textbook";


export default function TextbookForm({
    defaultValues,
    onSubmit,
}: {
    defaultValues?: Partial<UpdateTextbookInput>;
    onSubmit: (values: UpdateTextbookInput) => void;
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateTextbookInput>({
        resolver: zodResolver(updateTextbookSchema),
        defaultValues,
    });

    // 🔥 important for edit
    useEffect(() => {
        if (defaultValues) reset(defaultValues);
    }, [defaultValues, reset]);

    const submit = (data: UpdateTextbookInput) => {
        onSubmit(data)
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="
        grid grid-cols-1 md:grid-cols-2 gap-4
        bg-white p-6 rounded-xl ring-1 ring-black/5
      "
        >
            <Input label="Title" {...register("title")} error={errors.title?.message} />

            <Input label="Class" {...register("class")} error={errors.class?.message} />

            <Input label="Subject" {...register("subject")} />

            <Select label="Medium" {...register("medium")}>
                <option value="">Select</option>
                <option value="English">English</option>
                <option value="Kannada">Kannada</option>
            </Select>

            <Input
                label="Edition Year"
                type="number"
                {...register("editionYear")}
                error={errors.editionYear?.message}
            />

            <Input
                label="MRP"
                type="number"
                {...register("mrp", { valueAsNumber: true })}
                error={errors.mrp?.message}
            />

            <div className="md:col-span-2 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
            inline-flex items-center gap-2 px-5 py-2 rounded-md text-white
            ${isSubmitting
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"}
          `}
                >
                    {isSubmitting && <Spinner />}
                    Update Textbook
                </button>
            </div>
        </form>
    );
}

/* ================= UI HELPERS ================= */

function Input({
    label,
    error,
    ...props
}: {
    label: string;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="text-sm text-slate-600">{label}</label>
            <input
                {...props}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

function Select({
    label,
    children,
    ...props
}: {
    label: string;
    children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            <label className="text-sm text-slate-600">{label}</label>
            <select
                {...props}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
                {children}
            </select>
        </div>
    );
}
