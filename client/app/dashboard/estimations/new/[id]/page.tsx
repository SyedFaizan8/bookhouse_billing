"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuthUser } from "@/lib/queries/auth";
import { API_BASE_URL } from "@/lib/constants";
import { useCreateEstimation, useSchoolProfile } from "@/lib/queries/schools";
import { numberToWords } from "@/lib/utils/numberToWords";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useNextEstimationNumber } from "@/lib/queries/nextNumber";
import { handleApiError } from "@/lib/utils/getApiError";
import Spinner from "@/components/Spinner";
import FormLoader from "@/components/loaders/FormLoader";

/* ======================================================
   VALIDATION SCHEMA
====================================================== */

const ItemSchema = z.object({
    description: z.string().trim().min(1, "Description required"),
    class: z.string().optional(),
    company: z.string().optional(),
    quantity: z.number().int().min(1, "Qty must be ≥ 1"),
    rate: z.number().min(0, "Rate cannot be negative"),
    discountPercent: z
        .number()
        .min(0)
        .max(99, "Discount cannot be 100%"),
});

const Schema = z.object({
    estimationNo: z
        .string()
        .trim()
        .min(1, "Estimation number is required"),
    items: z.array(ItemSchema).min(1, "At least one item required"),
    notes: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

/* ======================================================
   HELPERS
====================================================== */

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

/* ======================================================
   PAGE
====================================================== */

export default function EstimationPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: customer, isLoading } = useSchoolProfile(id);
    const { data: company } = useSettingsInfo();
    const { data: user } = useAuthUser();
    const { data: estimationNextNumber } = useNextEstimationNumber()

    const createInvoice = useCreateEstimation();

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            estimationNo: "",
            items: [
                {
                    description: "",
                    class: "",
                    company: "",
                    quantity: 1,
                    rate: 0,
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

    useEffect(() => {
        if (estimationNextNumber?.nextNumber) {
            form.setValue(
                "estimationNo",
                String(estimationNextNumber.nextNumber)
            );
        }
    }, [estimationNextNumber]);


    /* ======================================================
       CALCULATIONS (SAFE)
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

        if (data.items.length === 0) {
            toast.warning("Add at least one item");
            return;
        }

        for (const [index, item] of data.items.entries()) {

            if (!item.description.trim()) {
                toast.warning(`Item ${index + 1}: Description required`);
                return;
            }

            if (item.quantity <= 0) {
                toast.warning(`Item ${index + 1}: Quantity must be greater than zero`);
                return;
            }

            if (item.discountPercent >= 100) {
                toast.warning(`Item ${index + 1}: Discount cannot be 100%`);
                return;
            }
        }

        if (totals.finalAmount <= 0) {
            toast.warning("Estimation total must be greater than zero");
            return;
        }

        createInvoice.mutate(
            {
                schoolId: id,
                billedByUserId: user!.id,
                notes: data.notes,
                documentNo: data.estimationNo,

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
                    toast.success("Estimation created successfully");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message)
            }
        );
    };


    if (isLoading || !customer || !company) return <FormLoader />;

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

                    {/* Top row: estimation no + date */}
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
                        {/* Estimation number */}
                        <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap">
                                Estimation No:
                            </span>

                            <input
                                {...form.register("estimationNo")}
                                className="
                                    w-28 sm:w-32
                                    border rounded
                                    px-2 py-0.5
                                    text-sm text-center font-semibold
                                    focus:ring-2 focus:ring-indigo-500
                                    "
                            />
                        </div>

                        {/* Date */}
                        <span>{formatDate()}</span>
                    </div>

                    {/* Logo */}
                    {company.logoUrl && (
                        <img
                            src={'/api' + company.logoUrl}
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
                        ESTIMATION
                    </span>
                </div>


                {/* School */}
                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700">TO</div>

                    {/* School name */}
                    <div className="font-semibold text-slate-900">
                        {customer.name}
                    </div>

                    {/* Contact person */}
                    {customer.contactPerson && (
                        <div className="text-sm text-slate-700">
                            Attn: {customer.contactPerson}
                        </div>
                    )}

                    {/* Address */}
                    {(customer.street ||
                        customer.town ||
                        customer.district ||
                        customer.state ||
                        customer.pincode) && (
                            <div className="text-sm text-slate-600 leading-relaxed">
                                {[
                                    customer.street,
                                    customer.town,
                                    customer.district,
                                    customer.state,
                                    customer.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}

                    {/* Phone */}
                    <div className="text-sm text-slate-700">
                        Phone: {customer.phone}
                    </div>

                    {/* Email */}
                    {customer.email && (
                        <div className="text-sm text-slate-600">
                            Email: {customer.email}
                        </div>
                    )}

                    {/* GST */}
                    {customer.gst && (
                        <div className="text-sm font-medium text-slate-700">
                            GSTIN: {customer.gst}
                        </div>
                    )}
                </div>


                {/* TABLE */}
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
                    <div className="w-96 border p-4 bg-slate-50 text-sm space-y-1">
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

                {/* AMOUNT WORDS */}
                <div className="italic text-sm">
                    Amount Chargeable (in words):{" "}
                    <strong>{numberToWords(totals.finalAmount)}</strong>
                </div>

                {/* NOTES */}
                <textarea
                    {...form.register("notes")}
                    className="w-full border p-2 text-sm"
                    placeholder="Notes (optional)"
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
                    <div className="w-full sm:w-[32%] border rounded-md p-4 flex flex-col items-center justify-center">
                        <img
                            src={'/api' + company.qrCodeUrl}
                            alt="UPI QR"
                            width={90}
                            height={90}
                            className="object-contain"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Scan to pay
                        </p>
                    </div>
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
                    disabled={createInvoice.isPending}
                    onClick={form.handleSubmit(submit)}
                    className="
                        w-full
                        bg-indigo-700
                        hover:bg-indigo-800
                        text-white
                        py-3
                        rounded-lg
                        text-lg
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    {createInvoice.isPending
                        ? <span className="flex items-center justify-center gap-2">
                            <Spinner size={18} /> Saving...
                        </span>
                        : "Save Estimation"}
                </button>

            </div>
        </div>
    );
}
