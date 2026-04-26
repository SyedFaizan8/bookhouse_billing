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

import { useAuthUser } from "@/lib/queries/auth";
import { useSettingsInfo } from "@/lib/queries/settings";

import Spinner from "@/components/Spinner";
import { useInvoicePdf, useUpdateInvoice } from "@/lib/queries/schools";
import FormLoader from "@/components/loaders/FormLoader";
import Image from "next/image";

import { useSortableItems } from "@/lib/hooks/useSortableItems";
import SortItemsDropdown from "@/components/SortItemsDropdown";

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
    invoiceNo: z.string().regex(/^\d+$/, "Invoice number must be numeric"),
    date: z.string().min(1, "Date is required"),
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

/* ======================================================
   PAGE
====================================================== */

export default function EditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: invoice, isLoading } = useInvoicePdf(id);
    const { data: company } = useSettingsInfo();
    const { data: user } = useAuthUser();

    const updateInvoice = useUpdateInvoice(id);

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            invoiceNo: "",
            items: [],
            notes: "",
            date: ""
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const items = useWatch({
        control: form.control,
        name: "items",
    }) || [];

    const { sortItems } = useSortableItems(form, replace);
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

            return { gross, discAmt, net };
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
                    toast.success("Invoice updated successfully");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    if (isLoading || !invoice || !company) return <FormLoader />;

    /* ======================================================
       UI
    ===================================================== */

    return (
        <div className="py-4">

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm rounded hover:bg-slate-100 mb-4"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="mx-auto bg-white shadow-2xl p-8 rounded-lg space-y-6">

                {/* HEADER */}
                <div className=" text-center">

                    {/* Top row: invoice no + date */}
                    <div
                        className="
                            flex flex-col
                            sm:flex-row
                            sm:justify-between
                            gap-2
                            text-sm
                            text-slate-600
                            "
                    >
                        {/* invoice number */}
                        <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap">
                                Invoice No:
                            </span>

                            <input
                                type="number"
                                {...form.register("invoiceNo")}
                                className="
                                    w-28 sm:w-32
                                    border rounded
                                    px-2 py-0.5
                                    text-sm text-center font-semibold
                                    focus:ring-2 focus:ring-indigo-500
                                    appearance-none
                                    [&::-webkit-inner-spin-button]:appearance-none
                                    [&::-webkit-outer-spin-button]:appearance-none
                                    "
                            />
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2">
                            <span>Date:</span>

                            <input
                                type="date"
                                {...form.register("date")}
                                className="
                                    border rounded
                                    px-2 py-0.5
                                    text-sm
                                    focus:ring-2 focus:ring-indigo-500
                                    "
                            />
                        </div>
                    </div>

                    {/* Logo */}
                    {company.logoUrl && (
                        <Image
                            src={company.logoUrl}
                            alt="Company Logo"
                            width={90}
                            height={90}
                            className="mx-auto object-contain py-2"
                        />
                    )}

                    {/* Company Name */}
                    <h1 className="text-3xl font-bold tracking-wide text-indigo-900 pt-2">
                        {company.name.toUpperCase()}
                    </h1>

                    {/* Address */}
                    {(company.street ||
                        company.town ||
                        company.district ||
                        company.state ||
                        company.pincode) && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {[
                                    company.street,
                                    company.town,
                                    company.district,
                                    company.state,
                                    company.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        )}

                    {/* Contact */}
                    <p className="text-sm text-slate-700 font-medium">
                        📞 {company.phone}
                        {company.phoneSecondary && `, ${company.phoneSecondary}`}
                        {company.phoneTertiary && `, ${company.phoneTertiary}`}
                    </p>

                    {/* Email */}
                    {company.email && (
                        <p className="text-sm text-slate-600">
                            ✉️ {company.email}
                        </p>
                    )}

                    {/* GST */}
                    {company.gst && (
                        <p className="text-sm font-semibold text-slate-700">
                            GSTIN: {company.gst}
                        </p>
                    )}

                    {/* Document type badge */}
                    <span className="inline-block bg-indigo-50 text-indigo-800 text-md font-bold px-6 py-1 rounded-full tracking-wide mt-4">
                        BILL OF SUPPLY
                    </span>
                </div>

                {/* School */}
                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700 underline">TO</div>

                    {/* School name */}
                    <div className="font-semibold text-slate-900">
                        {invoice.school.name}
                    </div>

                    {/* Contact person */}
                    {invoice.school.contactPerson && (
                        <div className="text-sm text-slate-700">
                            Attn: {invoice.school.contactPerson}
                        </div>
                    )}

                    {/* Address */}
                    {(invoice.school.street ||
                        invoice.school.town ||
                        invoice.school.district ||
                        invoice.school.state ||
                        invoice.school.pincode) && (
                            <div className="text-sm text-slate-600 leading-relaxed">
                                {[
                                    invoice.school.street,
                                    invoice.school.town,
                                    invoice.school.district,
                                    invoice.school.state,
                                    invoice.school.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}

                    {/* Phone */}
                    <div className="text-sm text-slate-700">
                        Phone: {invoice.school.phone}
                    </div>

                    {/* Email */}
                    {invoice.school.email && (
                        <div className="text-sm text-slate-600">
                            Email: {invoice.school.email}
                        </div>
                    )}

                    {/* GST */}
                    {invoice.school.gst && (
                        <div className="text-sm font-medium text-slate-700">
                            GSTIN: {invoice.school.gst}
                        </div>
                    )}
                </div>

                {/* SORT ITEMS */}
                <div className="flex justify-end mb-4">
                    <SortItemsDropdown
                        onSort={sortItems}
                        options={[
                            { label: "Description A → Z", key: "description", direction: "asc" },
                            { label: "Description Z → A", key: "description", direction: "desc" },

                            { label: "Company A → Z", key: "company", direction: "asc" },
                            { label: "Company Z → A", key: "company", direction: "desc" },

                            { label: "Qty Low → High", key: "quantity", direction: "asc" },
                            { label: "Qty High → Low", key: "quantity", direction: "desc" },

                            { label: "Rate Low → High", key: "rate", direction: "asc" },
                            { label: "Rate High → Low", key: "rate", direction: "desc" },

                            { label: "Discount Low → High", key: "discountPercent", direction: "asc" },
                            { label: "Discount High → Low", key: "discountPercent", direction: "desc" },
                        ]}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full text-sm border">
                        <thead className="bg-indigo-50 text-xs font-bold text-slate-700">
                            <tr>
                                <th className="px-2 py-2">SL</th>
                                <th className="px-3 py-2 text-left">Description</th>
                                <th className="px-2 py-2">Class</th>
                                <th className="px-2 py-2 text-left">Company</th>
                                <th className="px-2 py-2 text-center">Qty</th>
                                <th className="px-2 py-2 text-right">Rate</th>
                                <th className="px-2 py-2">Disc %</th>
                                <th className="px-2 py-2 text-right">Total</th>
                                <th className="px-2 py-2"></th>
                            </tr>
                        </thead>


                        <tbody className="divide-y">
                            {fields.map((f, i) => {
                                const t =
                                    totals.itemTotals[i] ?? {
                                        gross: 0,
                                        discAmt: 0,
                                        net: 0,
                                    };

                                return (
                                    <tr key={f.id} className="hover:bg-slate-50 transition">
                                        <td className="text-center text-slate-500">
                                            {i + 1}
                                        </td>

                                        <td className="px-2">
                                            <input
                                                {...form.register(`items.${i}.description`)}
                                                className="w-full border rounded px-2 focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Book name / description"
                                            />
                                        </td>

                                        <td className="px-2 text-center">
                                            <input
                                                {...form.register(`items.${i}.class`)}
                                                className="w-16 border rounded text-center"
                                                placeholder="10"
                                            />
                                        </td>

                                        <td className="px-2">
                                            <input
                                                {...form.register(`items.${i}.company`)}
                                                className="w-full border rounded px-2"
                                                placeholder="Company Name"
                                            />
                                        </td>

                                        <td className="px-2 text-center">
                                            <input
                                                type="number"
                                                {...form.register(`items.${i}.quantity`, {
                                                    valueAsNumber: true,
                                                })}
                                                min={0}
                                                className="w-16 border rounded text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                        </td>

                                        <td className="px-2 text-right">
                                            <input
                                                type="number"
                                                {...form.register(`items.${i}.rate`, {
                                                    valueAsNumber: true,
                                                })}
                                                min={0}
                                                className="w-24 border rounded text-right px-2 appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                        </td>

                                        <td className="px-2 text-center">
                                            <input
                                                type="number"
                                                {...form.register(`items.${i}.discountPercent`, {
                                                    valueAsNumber: true,
                                                })}
                                                min={0}
                                                className="w-16 border rounded text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                        </td>

                                        <td className="px-2 text-right font-semibold text-slate-900">
                                            ₹{t.net.toFixed(2)}
                                        </td>

                                        <td className="px-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => remove(i)}
                                                className="text-red-500 hover:bg-red-50 rounded p-1"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                        </tbody>
                    </table>
                </div>

                {/* ADD ITEM */}
                <button
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
                    className="text-indigo-700 text-sm"
                >
                    + Add Item
                </button>

                {/* TOTALS */}
                <div className="flex justify-end">
                    <div className="w-96 border p-4 bg-slate-50 text-sm">
                        <div className="flex justify-between">
                            <span>Total Qty</span>
                            <span>{totals.totalQty}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Gross</span>
                            <span>₹{totals.grossAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-700">
                            <span>Discount</span>
                            <span>-₹{totals.totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                            <span>Final</span>
                            <span>₹{totals.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* AMOUNT IN WORDS */}
                <div className="italic text-sm">
                    Amount Chargeable (in words):{" "}
                    <strong>{numberToWords(totals.finalAmount)}</strong>
                </div>

                {/* NOTES */}
                <textarea
                    {...form.register("notes")}
                    className="w-full border p-2 text-sm"
                    placeholder="Notes"
                />


                {/* BANK + QR */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">

                    {/* BANK DETAILS */}
                    <div className="border rounded-md p-4 text-sm space-y-1">
                        <div>Account: <strong>{company.name}</strong></div>
                        {company.bankName && <div>Bank: {company.bankName}</div>}
                        {company.accountNo && <div>A/C No: {company.accountNo}</div>}
                        {company.ifsc && <div>IFSC: {company.ifsc}</div>}
                        {company.upi && <div>UPI: {company.upi}</div>}
                    </div>

                    {/* QR */}
                    {company.qrCodeUrl && <div className="w-full sm:w-[32%] border rounded-md p-4 flex flex-col items-center justify-center">
                        <Image
                            src={company.qrCodeUrl}
                            alt="UPI QR"
                            width={100}
                            height={100}
                            className="object-contain"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Scan to pay
                        </p>
                    </div>}
                </div>

                {/* SIGNATURE */}
                <div className="text-right text-sm space-y-1">
                    <div>For <strong>{company.name && company.name.toUpperCase()}</strong></div>
                    <div className="font-bold mt-4">Authorized Signatory</div>
                    {user && <div className="text-xs text-slate-600">
                        Recorded By: {user.name}
                    </div>}
                </div>

                {/* FOOTER NOTE */}
                <p className="text-center text-xs text-slate-500 italic">
                    This is a computer-generated invoice
                </p>


                {/* SAVE */}
                <button
                    disabled={updateInvoice.isPending}
                    onClick={form.handleSubmit(submit)}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg text-lg disabled:opacity-50"
                >
                    {updateInvoice.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner size={18} /> Updating...
                        </span>
                    ) : ("Update Invoice")}
                </button>

            </div>
        </div>
    );
}
