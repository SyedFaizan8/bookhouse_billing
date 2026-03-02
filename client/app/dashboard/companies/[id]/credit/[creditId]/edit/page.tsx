"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { numberToWords } from "@/lib/utils/numberToWords";
import { handleApiError } from "@/lib/utils/getApiError";

import { useSettingsInfo } from "@/lib/queries/settings";
import Spinner from "@/components/Spinner";
import { useInvoicePdf, useUpdateInvoice } from "@/lib/queries/schools";
import FormLoader from "@/components/loaders/FormLoader";
import { useQueryClient } from "@tanstack/react-query";

/* ======================================================
   VALIDATION
====================================================== */

const ItemSchema = z.object({
    description: z.string().trim().min(1),
    class: z.string().optional(),
    company: z.string().optional(),
    quantity: z.number().int().min(1),
    rate: z.number().min(0),
    discountPercent: z.number().min(0).max(99),
});

const Schema = z.object({
    invoiceNo: z.string(),
    date: z.string().min(1, "Date is required"),
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

export default function EditCompanyCreditNotePage() {
    const { creditId } = useParams<{ creditId: string }>();
    const router = useRouter();

    const { data: invoice, isLoading } = useInvoicePdf(creditId);
    const { data: company } = useSettingsInfo();
    const qc = useQueryClient();

    const updateInvoice = useUpdateInvoice(creditId);

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            invoiceNo: "",
            date: "",
            items: [],
            notes: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const items = useWatch({
        control: form.control,
        name: "items",
    }) || [];

    /* ======================================================
       LOAD EXISTING DATA
    ===================================================== */

    useEffect(() => {
        if (!invoice) return;

        form.reset({
            invoiceNo: invoice.documentNo,
            date: new Date(invoice.date).toISOString().split("T")[0],
            notes: invoice.notes ?? "",
            items: invoice.items.map((i: any) => ({
                description: i.description,
                class: i.class ?? "",
                company: i.company ?? "",
                quantity: i.quantity,
                rate: i.rate,
                discountPercent: i.discountPercent,
            })),
        });
    }, [invoice, form]);

    /* ======================================================
       CALCULATIONS
    ===================================================== */

    const totals = useMemo(() => {
        let totalQty = 0;
        let grossAmount = 0;
        let totalDiscount = 0;

        const itemTotals = items.map((i) => {
            const qty = Number(i.quantity || 0);
            const rate = Number(i.rate || 0);
            const discPct = Number(i.discountPercent || 0);

            const gross = qty * rate;
            const discAmt = (gross * discPct) / 100;
            const net = Math.max(gross - discAmt, 0);

            totalQty += qty;
            grossAmount += gross;
            totalDiscount += discAmt;

            return { net };
        });

        return {
            totalQty,
            grossAmount,
            totalDiscount,
            finalAmount: Math.max(grossAmount - totalDiscount, 0),
            itemTotals,
        };
    }, [items]);

    /* ======================================================
       SUBMIT
    ===================================================== */

    const submit = (data: Form) => {
        if (totals.finalAmount <= 0) {
            toast.warning("Total must be greater than zero");
            return;
        }

        updateInvoice.mutate(
            {
                documentNo: data.invoiceNo,
                date: data.date,
                notes: data.notes,
                items: data.items.map((i) => ({
                    description: i.description.trim(),
                    class: i.class?.trim() || null,
                    company: i.company?.trim() || null,
                    quantity: i.quantity,
                    unitPrice: i.rate,
                    discountPercent: i.discountPercent,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Credit Note updated successfully");
                    qc.invalidateQueries({ queryKey: ["company-creditNote"] });
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    if (isLoading || !invoice || !company) return <FormLoader />;

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">

                {/* HEADER */}
                <div className="px-6 py-6 border-b bg-gradient-to-br from-rose-50 to-white text-center">

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-sm text-slate-600">

                        <div className="flex items-center gap-2 flex-col md:flex-row">
                            <span className="font-medium">Credit Note No:</span>
                            <input
                                {...form.register("invoiceNo")}
                                className="w-28 sm:w-32 border rounded-md px-2 py-1 text-sm text-center font-semibold focus:ring-2 focus:ring-rose-500 appearance-none
                                    [&::-webkit-inner-spin-button]:appearance-none
                                    [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-col md:flex-row mb-5 md:mb-0">
                            <span className="font-medium">Date:</span>
                            <input
                                type="date"
                                {...form.register("date")}
                                className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-rose-500"
                            />
                        </div>

                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-rose-700 tracking-wide">
                        PURCHASE CREDIT NOTE
                    </h1>
                </div>

                {/* ITEMS */}
                <div className="p-6 overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-sm border rounded-xl overflow-hidden">
                        <thead className="bg-rose-50 text-slate-700 text-xs font-semibold">
                            <tr>
                                <th>#</th>
                                <th className="text-left px-2">Description</th>
                                <th>Class</th>
                                <th>Qty</th>
                                <th className="text-right">Rate</th>
                                <th>Disc %</th>
                                <th className="text-right">Amount</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {fields.map((f, i) => (
                                <tr key={f.id} className="hover:bg-slate-50">
                                    <td className="text-center text-slate-500">{i + 1}</td>

                                    <td className="px-2">
                                        <input
                                            {...form.register(`items.${i}.description`)}
                                            className="w-full border rounded-md px-2 focus:ring-1 focus:ring-rose-500"
                                        />
                                    </td>

                                    <td className="text-center">
                                        <input
                                            {...form.register(`items.${i}.class`)}
                                            className="w-20 border rounded text-center"
                                        />
                                    </td>

                                    <td className="text-center">
                                        <input
                                            type="number"
                                            {...form.register(`items.${i}.quantity`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded text-center"
                                        />
                                    </td>

                                    <td className="text-right">
                                        <input
                                            type="number"
                                            {...form.register(`items.${i}.rate`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-24 border rounded px-2 text-right"
                                        />
                                    </td>

                                    <td className="text-center">
                                        <input
                                            type="number"
                                            {...form.register(`items.${i}.discountPercent`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded text-center"
                                        />
                                    </td>

                                    <td className="text-right font-semibold">
                                        ₹{totals.itemTotals[i]?.net.toFixed(2)}
                                    </td>

                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(i)}
                                            className="text-rose-500 hover:bg-rose-100 rounded p-1"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        type="button"
                        onClick={() =>
                            append({
                                description: "",
                                class: "",
                                company: "",
                                quantity: 1,
                                rate: 0,
                                discountPercent: 0,
                            })
                        }
                        className="mt-4 text-rose-600 text-sm font-medium"
                    >
                        + Add Item
                    </button>
                </div>

                {/* TOTALS */}
                <div className="bg-slate-50 border-t p-6 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Qty</span>
                        <span>{totals.totalQty}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>Gross</span>
                        <span>₹{totals.grossAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-green-700">
                        <span>Discount</span>
                        <span>-₹{totals.totalDiscount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Final Amount</span>
                        <span>₹{totals.finalAmount.toFixed(2)}</span>
                    </div>

                    <div className="italic text-xs text-slate-600">
                        Amount in words: {numberToWords(totals.finalAmount)}
                    </div>
                </div>

                {/* SAVE */}
                <div className="p-6 border-t">
                    <button
                        disabled={updateInvoice.isPending}
                        onClick={form.handleSubmit(submit)}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-base font-semibold transition disabled:opacity-50"
                    >
                        {updateInvoice.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} /> Updating...
                            </span>
                        ) : (
                            "Update Purchase Credit Note"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}