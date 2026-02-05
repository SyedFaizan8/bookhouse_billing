"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";
import FormLoader from "@/components/loaders/FormLoader";

import { InvoicePdfData } from "@/lib/types/invoice";
import { useInvoicePdf, useUpdatePending } from "@/lib/queries/schools";
import { handleApiError } from "@/lib/utils/getApiError";

/* ======================================================
   TYPES
====================================================== */

type Form = {
    items: {
        id: string;
        pending: number;
    }[];
};

/* ======================================================
   PAGE
====================================================== */

export default function PackagePendingPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading } = useInvoicePdf(id);
    const updatePending = useUpdatePending(id);

    const form = useForm<Form>({
        defaultValues: { items: [] },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    /* ======================================================
       LOAD DATA
    ===================================================== */

    React.useEffect(() => {
        if (!data) return;

        const invoice = data as InvoicePdfData;

        replace(
            invoice.items.map((i) => ({
                id: i.id,
                pending: i.pending,
            }))
        );
    }, [data, replace]);

    /* ======================================================
       SUBMIT
    ===================================================== */

    const submit = (values: Form) => {
        updatePending.mutate(values.items, {
            onSuccess: () => {
                toast.success("Pending updated successfully");
                router.back();
            },
            onError: (e) => toast.error(handleApiError(e).message),
        });
    };

    if (isLoading || !data) return <FormLoader />;

    const invoice = data as InvoicePdfData;

    /* ======================================================
       CALCULATIONS (nice summary)
    ===================================================== */

    const totalQty = invoice.items.reduce((a, b) => a + b.quantity, 0);
    const totalPending = form
        .watch("items")
        ?.reduce((a, b) => a + (b.pending || 0), 0);

    /* ======================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ================= HEADER ================= */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10 rounded">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm border px-3 py-1.5 rounded hover:bg-slate-100"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="flex items-center gap-2 font-semibold text-indigo-900">
                        <Package size={18} />
                        Package #{invoice.documentNo}
                    </div>
                </div>
            </div>


            {/* ================= BODY ================= */}
            <form
                onSubmit={form.handleSubmit(submit)}
                className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6"
            >

                {/* TITLE */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-indigo-900">
                        Update Pending Books
                    </h1>
                    <p className="text-sm text-slate-500">
                        Adjust remaining quantity to supply
                    </p>
                </div>


                {/* SUMMARY */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-xs text-slate-500">Total Qty</div>
                        <div className="text-xl font-bold">{totalQty}</div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-xs text-slate-500">Pending</div>
                        <div className="text-xl font-bold text-red-600">
                            {totalPending}
                        </div>
                    </div>
                </div>


                {/* ================= ITEMS ================= */}
                <div className="space-y-3">

                    {fields.map((field, i) => {
                        const item = invoice.items[i];

                        return (
                            <div
                                key={field.id}
                                className="
                                    bg-white
                                    rounded-xl
                                    shadow-sm
                                    border
                                    p-4
                                    flex
                                    flex-col
                                    sm:flex-row
                                    sm:items-center
                                    gap-4
                                "
                            >
                                {/* LEFT */}
                                <div className="flex-1 space-y-1">
                                    <div className="font-semibold text-slate-800">
                                        {item.description}
                                    </div>

                                    <div className="text-xs text-slate-500">
                                        {item.company || "-"} •{" "}
                                        {item.class || "-"}
                                    </div>
                                </div>

                                {/* QTY */}
                                <div className="text-center">
                                    <div className="text-xs text-slate-500">
                                        Qty
                                    </div>
                                    <div className="font-bold text-lg">
                                        {item.quantity}
                                    </div>
                                </div>

                                {/* PENDING INPUT */}
                                <div className="text-center">
                                    <div className="text-xs text-red-600 font-medium">
                                        Pending
                                    </div>

                                    <input
                                        type="number"
                                        min={0}
                                        max={item.quantity}
                                        {...form.register(`items.${i}.pending`, {
                                            valueAsNumber: true,
                                        })}
                                        className="
                                            w-24 mt-1
                                            border
                                            rounded-lg
                                            text-center
                                            text-red-600
                                            font-bold
                                            py-2
                                            focus:ring-2
                                            focus:ring-indigo-500
                                        "
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* ================= SAVE BUTTON ================= */}
                <div className="sticky bottom-0 bg-slate-50 pt-4 pb-2">
                    <button
                        type="submit"
                        disabled={updatePending.isPending}
                        className="
                            w-full
                            bg-indigo-700 hover:bg-indigo-800
                            text-white
                            py-3
                            rounded-lg
                            font-semibold
                            shadow-lg
                            disabled:opacity-50
                        "
                    >
                        {updatePending.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={16} /> Saving...
                            </span>
                        ) : (
                            "Save Pending"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
