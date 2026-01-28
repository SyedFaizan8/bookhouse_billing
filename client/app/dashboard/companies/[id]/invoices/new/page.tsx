"use client"

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuthUser } from "@/lib/queries/auth";
import { useCompanyProfile, useCreateCompanyInvoice } from "@/lib/queries/company";
import { useSettingsInfo } from "@/lib/queries/settings";
import { numberToWords } from "@/lib/utils/numberToWords";
import { handleApiError } from "@/lib/utils/getApiError";

/* ======================================================
   SCHEMA
====================================================== */

const Schema = z.object({
    supplierInvoiceNo: z
        .string()
        .trim()
        .min(1, "Company invoice number is required"),

    invoiceDate: z.string().min(1, "Invoice date is required"),

    items: z.array(
        z.object({
            description: z.string().min(1),
            class: z.string().optional(),
            company: z.string().optional(),
            quantity: z.number().int().min(1),
            unitPrice: z.number().min(0),
            discountPercent: z.number().min(0).max(99),
        })
    ).min(1),

    notes: z.string().optional(),
});


type Form = z.infer<typeof Schema>;

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

/* ======================================================
   PAGE
====================================================== */

export default function PurchaseInvoicePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    console.log(id)

    const { data: supplier } = useCompanyProfile(id);
    const { data: settings } = useSettingsInfo();
    const { data: user } = useAuthUser();

    const createInvoice = useCreateCompanyInvoice();

    const today = new Date().toISOString().split("T")[0];

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            invoiceDate: today,
            items: [
                {
                    description: "",
                    class: "",
                    company: "",
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

    /* ================= CALCULATIONS ================= */

    const totals = useMemo(() => {
        let totalQty = 0;
        let gross = 0;
        let discount = 0;

        const itemTotals = items.map((i) => {
            const g = i.quantity * i.unitPrice;
            const d = (g * i.discountPercent) / 100;
            const n = g - d;

            totalQty += i.quantity;
            gross += g;
            discount += d;

            return { net: n };
        });

        return {
            totalQty,
            gross,
            discount,
            final: Math.max(gross - discount, 0),
            itemTotals,
        };
    }, [items]);

    /* ================= SUBMIT ================= */

    const submit = (data: Form) => {
        if (!id) {
            toast.error("Company not found");
            return;
        }

        if (!user?.id) {
            toast.error("User not logged in");
            return;
        }

        if (!data.supplierInvoiceNo.trim()) {
            toast.warning("Company invoice number is required");
            return;
        }

        if (!data.items.length) {
            toast.warning("Add at least one item");
            return;
        }

        let total = 0;

        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];

            const qty = Number(item.quantity);
            const rate = Number(item.unitPrice);
            const disc = Number(item.discountPercent || 0);

            if (!item.description.trim()) {
                toast.warning(`Item ${i + 1}: Description required`);
                return;
            }

            if (qty <= 0 || !Number.isInteger(qty)) {
                toast.warning(`Item ${i + 1}: Invalid quantity`);
                return;
            }

            if (rate < 0 || isNaN(rate)) {
                toast.warning(`Item ${i + 1}: Invalid rate`);
                return;
            }

            if (disc < 0 || disc >= 100 || isNaN(disc)) {
                toast.warning(`Item ${i + 1}: Invalid discount`);
                return;
            }

            const net = qty * rate * (1 - disc / 100);

            if (net <= 0) {
                toast.warning(`Item ${i + 1}: Amount must be greater than zero`);
                return;
            }

            total += net;
        }

        total = Number(total.toFixed(2));

        if (total <= 0) {
            toast.error("Invoice total must be greater than zero");
            return;
        }

        // ✅ SAFE TO SUBMIT
        console.log("VALID PURCHASE INVOICE", {
            supplierInvoiceNo: data.supplierInvoiceNo.trim(),
            total,
        });

        createInvoice.mutate(
            {
                companyId: id,
                recordedByUserId: user!.id,
                supplierInvoiceNo: data.supplierInvoiceNo,
                invoiceDate: data.invoiceDate,
                notes: data.notes,
                items: data.items,
            },
            {
                onSuccess: () => {
                    toast.success("Purchase invoice recorded");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );

    };

    if (!supplier || !settings) return null;

    /* ================= UI ================= */

    return (
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">

                {/* HEADER */}
                <div className="px-6 py-6 border-b bg-gradient-to-br from-indigo-50 to-white text-center space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-indigo-900">
                        PURCHASE INVOICE
                    </h1>
                    <p className="text-xs text-slate-500">
                        Company invoice (internal accounting record)
                    </p>
                </div>

                {/* META */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border-b">
                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Company Invoice No
                        </label>
                        <input
                            {...form.register("supplierInvoiceNo")}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter invoice number"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Invoice Date
                        </label>
                        <input
                            type="date"
                            max={today}   // 🚫 future dates blocked
                            {...form.register("invoiceDate")}
                            className="mt-1 w-full border rounded px-3 py-2"
                        />
                    </div>
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
                <div className="p-4 sm:p-6 overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm border rounded-xl overflow-hidden">
                        <thead className="bg-indigo-50 text-slate-700">
                            <tr>
                                <th className="px-2 py-2">#</th>
                                <th className="px-3 py-2 text-left">Description</th>
                                <th className="px-2 py-2 text-center">Class</th>
                                <th className="px-2 py-2 text-center">Qty</th>
                                <th className="px-2 py-2 text-right">Rate</th>
                                <th className="px-2 py-2 text-center">Disc %</th>
                                <th className="px-2 py-2 text-right">Amount</th>
                                <th></th>
                            </tr>
                        </thead>


                        <tbody className="divide-y">
                            {fields.map((f, i) => (
                                <tr key={f.id} className="hover:bg-slate-50">
                                    <td className="text-center text-slate-500">
                                        {i + 1}
                                    </td>

                                    <td className="px-2">
                                        <input
                                            {...form.register(`items.${i}.description`)}
                                            className="w-full border rounded-md px-2 "
                                            placeholder="Item description"
                                        />
                                    </td>

                                    <td className="px-2 text-center">
                                        <input
                                            {...form.register(`items.${i}.class`)}
                                            className="w-20 border rounded text-center px-1"
                                            placeholder="10"
                                        />
                                    </td>


                                    <td className="text-center">
                                        <input
                                            min={1}
                                            type="number"
                                            {...form.register(`items.${i}.quantity`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded-md text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </td>

                                    <td className="text-right">
                                        <input
                                            min={1}
                                            type="number"
                                            {...form.register(`items.${i}.unitPrice`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-24 border rounded-md text-right px-2 appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </td>

                                    <td className="text-center">
                                        <input
                                            min={0}
                                            max={100}
                                            type="number"
                                            {...form.register(`items.${i}.discountPercent`, {
                                                valueAsNumber: true,
                                            })}
                                            className="w-16 border rounded-md text-center appearance-none
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
                                quantity: 1,
                                unitPrice: 0,
                                discountPercent: 0,
                            })
                        }
                        className="mt-3 text-indigo-600 text-sm font-medium"
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
                        <span>Total Payable</span>
                        <span>₹{totals.final.toFixed(2)}</span>
                    </div>

                    <div className="italic text-xs text-slate-600">
                        Amount in words: {numberToWords(totals.final)}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 text-right text-sm space-y-1">
                    <div>
                        For <strong>{settings.name.toUpperCase()}</strong>
                    </div>
                    <div className="font-bold mt-4">
                        Authorized Signatory
                    </div>
                    <div className="text-xs text-slate-500">
                        Recorded by: {user?.name}
                    </div>
                </div>

                {/* SAVE */}
                <div className="p-5 border-t">
                    <button
                        onClick={form.handleSubmit(submit)}
                        className="
                        w-full
                        bg-indigo-700 hover:bg-indigo-800
                        text-white
                        py-3
                        rounded-xl
                        text-base
                        font-semibold
                        transition
                    "
                    >
                        Save Purchase Invoice
                    </button>
                </div>
            </div>
        </div>
    );

}
