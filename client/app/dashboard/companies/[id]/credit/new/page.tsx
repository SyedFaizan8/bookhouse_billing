"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { useAuthUser } from "@/lib/queries/auth";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useCompanyProfile, useCreateCompanyCreditNote } from "@/lib/queries/company";
import { numberToWords } from "@/lib/utils/numberToWords";
import { API_BASE_URL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/getApiError";
import Spinner from "@/components/Spinner";

/* ======================================================
   SCHEMA
====================================================== */

const ItemSchema = z.object({
    description: z.string().trim().min(1, "Description required"),
    class: z.string().optional(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    discountPercent: z.number().min(0).max(99),
});

const Schema = z.object({
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

/* ======================================================
   PAGE
====================================================== */

export default function PurchaseCreditNotePage() {
    const { id } = useParams<{ id: string }>(); // company id
    const router = useRouter();

    const { data: supplier } = useCompanyProfile(id);
    const { data: settings } = useSettingsInfo();
    const { data: user } = useAuthUser();

    const createCreditNote = useCreateCompanyCreditNote();

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            items: [
                {
                    description: "",
                    class: "",
                    quantity: 1,
                    unitPrice: 0,
                    discountPercent: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const items = useWatch({ control: form.control, name: "items" }) || [];

    /* ======================================================
       CALCULATIONS
    ===================================================== */

    const totals = useMemo(() => {
        let qty = 0;
        let gross = 0;
        let discount = 0;

        const itemTotals = items.map((i) => {
            const g = i.quantity * i.unitPrice;
            const d = (g * i.discountPercent) / 100;
            const n = Math.max(g - d, 0);

            qty += i.quantity;
            gross += g;
            discount += d;

            return { net: n };
        });

        return {
            totalQty: qty,
            gross,
            discount,
            final: Math.max(gross - discount, 0),
            itemTotals,
        };
    }, [items]);

    /* ======================================================
       SUBMIT
    ===================================================== */

    const submit = (data: Form) => {
        if (!user?.id) return toast.error("User not logged in");
        if (!supplier) return toast.error("Company not found");

        if (totals.final <= 0) {
            return toast.warning("Credit note amount must be greater than zero");
        }

        for (let i = 0; i < data.items.length; i++) {
            const it = data.items[i];

            if (!it.description.trim()) {
                return toast.warning(`Item ${i + 1}: Description required`);
            }

            if (it.quantity <= 0) {
                return toast.warning(`Item ${i + 1}: Invalid quantity`);
            }

            if (it.discountPercent >= 100) {
                return toast.warning(`Item ${i + 1}: Discount cannot be 100%`);
            }
        }

        createCreditNote.mutate(
            {
                companyId: id,
                billedByUserId: user.id,
                notes: data.notes,
                items: data.items.map((i) => ({
                    description: i.description.trim(),
                    class: i.class?.trim() || null,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    discountPercent: i.discountPercent,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Credit note created");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    if (!supplier || !settings) return null;

    /* ======================================================
       UI
    ===================================================== */

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
                    <h1 className="text-xl sm:text-2xl font-bold text-rose-700 tracking-wide">
                        PURCHASE CREDIT NOTE
                    </h1>
                    <p className="text-xs text-slate-500">
                        Credit issued against company invoice
                    </p>
                </div>

                {/* COMPANY */}
                <div className="p-5 border-b">
                    <div className="text-xs font-bold text-slate-500 mb-1 underline ">
                        FROM (Company)
                    </div>

                    <div className="text-sm">
                        {/* Company name */}
                        <div className="font-semibold text-slate-900">
                            {supplier.name}
                        </div>

                        {/* Address */}
                        {(supplier.street ||
                            supplier.town ||
                            supplier.district ||
                            supplier.state ||
                            supplier.pincode) && (
                                <div className="text-xs text-slate-600 leading-relaxed">
                                    {[
                                        supplier.street,
                                        supplier.town,
                                        supplier.district,
                                        supplier.state,
                                        supplier.pincode,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </div>
                            )}

                        {/* Phone */}
                        <div className="text-xs font-bold text-slate-500">
                            Phone: {supplier.phone}
                        </div>

                        {/* Email */}
                        {supplier.email && (
                            <div className="text-xs text-slate-600">
                                Email: {supplier.email}
                            </div>
                        )}

                        {/* GST */}
                        {supplier.gst && (
                            <div className="text-xs font-medium text-slate-700">
                                GSTIN: {supplier.gst}
                            </div>
                        )}
                    </div>
                </div>

                {/* ITEMS */}
                <div className="p-4 sm:p-6 overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-[900px] w-full text-sm border rounded-xl overflow-hidden">
                        <thead className="bg-rose-50 text-slate-700 text-xs font-semibold">
                            <tr>
                                <th className="w-10">#</th>
                                <th className="min-w-[260px] text-left px-2">Description</th>
                                <th className="w-20 text-center">Class</th>
                                <th className="w-16 text-center">Qty</th>
                                <th className="w-24 text-right">Rate</th>
                                <th className="w-20 text-center">Disc %</th>
                                <th className="w-28 text-right">Amount</th>
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
                                            className="w-full border rounded-md px-2"
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
                                            min={1}
                                            {...form.register(`items.${i}.quantity`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </td>

                                    <td className="text-right">
                                        <input
                                            type="number"
                                            min={0}
                                            {...form.register(`items.${i}.unitPrice`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-24 border rounded px-2 text-right appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </td>

                                    <td className="text-center">
                                        <input
                                            type="number"
                                            min={0}
                                            max={99}
                                            {...form.register(`items.${i}.discountPercent`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </td>

                                    <td className="text-right font-semibold">
                                        ₹{totals.itemTotals[i]?.net.toFixed(2)}
                                    </td>

                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(i)}
                                            className="text-red-500 hover:bg-red-100 rounded p-1"
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
                                quantity: 1,
                                unitPrice: 0,
                                discountPercent: 0,
                            })
                        }
                        className="mt-3 text-rose-600 text-sm font-medium"
                    >
                        + Add Item
                    </button>
                </div>

                {/* TOTALS */}
                <div className="bg-slate-50 border-t p-5 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Total Qty</span>
                        <span>{totals.totalQty}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span>Gross</span>
                        <span>₹{totals.gross.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-green-700">
                        <span>Discount</span>
                        <span>-₹{totals.discount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Credit Amount</span>
                        <span>₹{totals.final.toFixed(2)}</span>
                    </div>

                    <div className="italic text-xs text-slate-600">
                        Amount in words: {numberToWords(totals.final)}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 text-right text-sm">
                    <div>
                        For <strong>{settings.name.toUpperCase()}</strong>
                    </div>
                    <div className="font-bold mt-4">Authorized Signatory</div>
                    <div className="text-xs text-slate-500">
                        Recorded By: {user?.name}
                    </div>
                </div>

                {/* SAVE */}
                <div className="p-5 border-t">
                    <button
                        disabled={createCreditNote.isPending}
                        onClick={form.handleSubmit(submit)}
                        className="
                            w-full
                            bg-rose-600 hover:bg-rose-700
                            text-white
                            py-3
                            rounded-xl
                            text-base
                            font-semibold
                            transition
                            disabled:opacity-50
                        "
                    >
                        {createCreditNote.isPending
                            ? <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} /> Saving...
                            </span>
                            : "Save Credit Note"}
                    </button>
                </div>
            </div>
        </div>
    );
}
