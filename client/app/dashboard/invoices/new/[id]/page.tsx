"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation"
import { useCustomerProfile } from "@/lib/queries/customers";
import { useCompanyInfo } from "@/lib/queries/company";
import { TextbookSearchResult } from "@/lib/types/inventory";
import { useCreateProvisionalInvoice, useInvoiceNumber } from "@/lib/queries/invoice";
import { ArrowLeft } from "lucide-react";
import { useAuthUser } from "@/lib/queries/auth";
import api from "@/lib/utils/axios";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

/* ================= SCHEMA ================= */

const ItemSchema = z.object({
    textbookId: z.string().optional(),
    title: z.string().min(1),
    qty: z.number().int().min(1),
    rate: z.number().min(0),
    discountPercent: z.number().min(0).max(100),
    stock: z.number().optional(),
});

const Schema = z.object({
    customer: z.any().optional(),
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
    userId: z.uuid().optional()
});

type Form = z.infer<typeof Schema>;

/* ================= HELPERS ================= */

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const numberToWords = (num: number): string => {
    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen",
    ];
    const b = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const inWords = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
        if (n < 1000)
            return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
        if (n < 100000)
            return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
        if (n < 10000000)
            return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
        return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
    };

    return inWords(Math.floor(num)).trim();
};

/* ================= PAGE ================= */

export default function InvoicePage() {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading } = useCustomerProfile(id)
    const { data: company } = useCompanyInfo();
    const { data: user } = useAuthUser();
    const { data: invoiceNumberData } = useInvoiceNumber()
    const createInvoice = useCreateProvisionalInvoice();


    const router = useRouter()

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            items: [{ title: "", qty: 1, rate: 0, discountPercent: 0 }],
            customer: undefined,
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
        let grossAmount = 0;
        let totalDiscount = 0;

        const itemTotals = items.map((i) => {
            const qty = i.qty || 0;
            const rate = i.rate || 0;
            const discPct = i.discountPercent || 0;

            const gross = qty * rate;
            const discAmt = (gross * discPct) / 100;
            const net = gross - discAmt;

            totalQty += qty;
            grossAmount += gross;
            totalDiscount += discAmt;

            return { gross, discAmt, net };
        });

        return {
            totalQty,
            grossAmount,
            totalDiscount,
            finalAmount: grossAmount - totalDiscount,
            itemTotals,
        };
    }, [items]);

    /* ================= SEARCH ================= */

    const [itemResults, setItemResults] = useState<TextbookSearchResult[]>([]);
    const [search, setSearch] = useState<{
        index: number;
        value: string;
    } | null>(null);
    const [dropdown, setDropdown] = useState<{
        top: number;
        left: number;
        width: number;
        index: number;
    } | null>(null);


    useEffect(() => {
        if (!search || search.value.length < 2) {
            setItemResults([]);
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const { data } = await api.get(
                    "/inventory/textbooks/search",
                    {
                        params: { q: search.value },
                        signal: controller.signal,
                    }
                );

                setItemResults(data);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error(err);
                }
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [search]);


    /* ================= SUBMIT ================= */

    const submit = async (form: Form) => {
        createInvoice.mutate(
            {
                customerId: id,
                billedByUserId: user!.id,
                notes: form.notes,
                items: form.items.map(i => ({
                    textbookId: i.textbookId!,
                    quantity: i.qty,
                    unitPrice: i.rate,
                    discountType: "PERCENT",
                    discountValue: i.discountPercent,
                })),

            },
            {
                onSuccess: () => {
                    toast.success("Invoice created");
                    router.push(`/dashboard/customers/${id}/issued`);
                },
                onError: (e: any) => {
                    toast.error(e.message);
                },
            }
        );
    };


    useEffect(() => {
        if (data) {
            form.setValue("customer", data)
        }
    }, [data, form])


    if (!data) return null
    if (isLoading) return null
    if (!company) return null;

    /* ================= UI ================= */


    return (
        <div className="py-4">

            <button
                onClick={() => router.push(`/dashboard/customers/${id}/issued`)}
                className="
                    inline-flex items-center gap-2
                    rounded-md border border-slate-300
                    px-3 py-1.5
                    text-sm font-medium text-slate-700
                    hover:bg-slate-100
                    transition
                    mb-4
                "
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <div className="mx-auto bg-white shadow-2xl p-8 rounded-lg space-y-6">

                {/* ================= INVOICE HEADER ================= */}

                <div className="space-y-4">

                    {/* TOP ROW */}
                    <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                        {invoiceNumberData && <span>Invoice #{invoiceNumberData.invoiceNo}</span>}
                        <span>{formatDate()}</span>
                    </div>

                    {/* LOGO + COMPANY */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <Image
                                src="/logo.png"
                                alt="logo"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 tracking-wide">
                            {company.name.toUpperCase()}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                            {company.town}, {company.district}, {company.state} – {company.pincode}
                            <br />
                            {company.phone}
                            {company.email && <> • {company.email}</>}
                            {company.gst && <><br />GSTIN: {company.gst}</>}
                        </p>
                    </div>

                    {/* BADGE */}
                    <div className="flex justify-center">
                        <span className="bg-indigo-50 text-xs font-extrabold px-5 py-1.5 rounded-full">
                            BILL OF SUPPLY
                        </span>
                    </div>

                    <div className="border rounded-md p-4 bg-slate-50">
                        <div className="font-extrabold">
                            BILL TO
                        </div>

                        <div className="text-sm text-slate-700">
                            <div className="font-medium">{data.name}</div>
                            <div>
                                {data.street && data.street + ","} {data.town && data.town + ","}{" "}
                                {data.state && data.state + "-"} {data.pincode && data.pincode}
                            </div>

                            <div className="mt-1 text-xs">
                                {data.phone && data.phone}
                                {data.gst && (
                                    <span className="ml-3">
                                        GSTIN: {data.gst}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* ITEMS TABLE */}
                <div className="relative -mx-4 sm:mx-0 overflow-x-auto">
                    <table className="min-w-[1100px] w-full text-sm border border-gray-300 bg-white">
                        {/* HEADER */}
                        <thead className="bg-indigo-50 sticky top-0 z-10">
                            <tr className="text-xs font-semibold text-slate-700">
                                <th className="px-2 py-2 w-10 text-center">#</th>
                                <th className="px-3 py-2 text-left min-w-[280px]">Description</th>
                                <th className="px-2 py-2 w-20 text-center">Qty</th>
                                <th className="px-2 py-2 w-24 text-right">Rate</th>
                                <th className="px-2 py-2 w-28 text-right">Amount</th>
                                <th className="px-2 py-2 w-20 text-center">Disc %</th>
                                <th className="px-2 py-2 w-28 text-right">Disc Amt</th>
                                <th className="px-2 py-2 w-28 text-right">Net Amt</th>
                                <th className="px-2 py-2 w-10 text-center"></th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y">
                            {fields.map((f, i) => {
                                const t = totals.itemTotals[i] || {
                                    gross: 0,
                                    discAmt: 0,
                                    net: 0,
                                };

                                return (
                                    <tr key={f.id} className="h-12 align-middle">
                                        {/* SL */}
                                        <td className="px-2 text-center text-slate-500">
                                            {i + 1}
                                        </td>

                                        {/* DESCRIPTION */}
                                        <td className="px-3">
                                            <input
                                                {...form.register(`items.${i}.title`)}
                                                className="
                                                    w-full
                                                    border border-slate-300
                                                    rounded-md
                                                    px-2 py-1.5
                                                    text-sm
                                                    focus:outline-none
                                                    focus:ring-1 focus:ring-indigo-500
                                                    "
                                                placeholder="Book name"
                                                onChange={(e) => {
                                                    setSearch({
                                                        index: i,
                                                        value: e.target.value,
                                                    });

                                                    const r = e.currentTarget.getBoundingClientRect();
                                                    setDropdown({
                                                        top: r.bottom + window.scrollY,
                                                        left: r.left + window.scrollX,
                                                        width: r.width,
                                                        index: i,
                                                    });
                                                }}
                                            />
                                        </td>

                                        {/* QTY */}
                                        <td className="px-2 text-center">
                                            <input
                                                type="number"
                                                min={1}
                                                max={items[i]?.stock ?? undefined}
                                                {...form.register(`items.${i}.qty`, {
                                                    valueAsNumber: true,
                                                    validate: (v) =>
                                                        items[i]?.stock === undefined ||
                                                        v <= items[i].stock ||
                                                        `Only ${items[i].stock} available`,
                                                })}
                                                className="
                                                    w-16
                                                    border border-slate-300
                                                    rounded-md
                                                    px-2 py-1
                                                    text-center
                                                    focus:ring-1 focus:ring-indigo-500
                                                    "
                                            />
                                        </td>

                                        {/* RATE */}
                                        <td className="px-2 text-right">
                                            <input
                                                type="number"
                                                min={0}
                                                {...form.register(`items.${i}.rate`, {
                                                    valueAsNumber: true,
                                                })}
                                                className="
                                                    w-24
                                                    border border-slate-300
                                                    rounded-md
                                                    px-2 py-1
                                                    text-right
                                                    focus:ring-1 focus:ring-indigo-500
                                                "
                                            />
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="px-2 text-right text-slate-700">
                                            ₹{t.gross.toFixed(2)}
                                        </td>

                                        {/* DISC % */}
                                        <td className="px-2 text-center">
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                {...form.register(`items.${i}.discountPercent`, {
                                                    valueAsNumber: true,
                                                })}
                                                className="
                                                    w-16
                                                    border border-slate-300
                                                    rounded-md
                                                    px-2 py-1
                                                    text-center
                                                    focus:ring-1 focus:ring-indigo-500
                                                    "
                                            />
                                        </td>

                                        {/* DISC AMOUNT */}
                                        <td className="px-2 text-right text-green-700">
                                            ₹{t.discAmt.toFixed(2)}
                                        </td>

                                        {/* NET */}
                                        <td className="px-2 text-right font-semibold text-slate-900">
                                            ₹{t.net.toFixed(2)}
                                        </td>

                                        {/* DELETE */}
                                        <td className="px-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => remove(i)}
                                                className="
                                                    rounded-md
                                                    p-1
                                                    text-red-500
                                                    hover:bg-red-50
                                                    transition
                                                "
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


                <button
                    onClick={() =>
                        append({ title: "", qty: 1, rate: 0, discountPercent: 0 })
                    }
                    className="text-indigo-700 text-sm"
                >
                    + Add Item
                </button>

                {/* TOTALS */}
                <div className="flex justify-end">
                    <div className="w-96 text-sm border rounded-md p-4 bg-slate-50 space-y-1">
                        <div className="flex justify-between">
                            <span>Total Pieces</span>
                            <span>{totals.totalQty}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span>₹{totals.grossAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-700">
                            <span>Total Discount</span>
                            <span>-₹{totals.totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Final Amount</span>
                            <span>₹{totals.finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* AMOUNT IN WORDS */}
                <div className="italic text-sm">
                    Amount Chargeable (in words):{" "}
                    <strong>
                        Rupees {numberToWords(totals.finalAmount)} Only
                    </strong>
                </div>

                {/* NOTES */}
                <textarea
                    {...form.register("notes")}
                    className="w-full border rounded p-2 text-sm"
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
                            src={API_BASE_URL + company.qrCodeUrl}
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
                        Billed By: {user.name}
                    </div>}
                </div>

                {/* FOOTER NOTE */}
                <p className="text-center text-xs text-slate-500 italic">
                    This is a computer-generated invoice
                </p>

                {/* SAVE */}
                <button
                    onClick={form.handleSubmit(submit)}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg text-lg"
                >
                    Save Invoice
                </button>
            </div>

            {/* ITEM DROPDOWN */}
            {dropdown &&
                itemResults.length > 0 &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            top: dropdown.top,
                            left: dropdown.left,
                            width: dropdown.width,
                            zIndex: 9999,
                        }}
                        className="bg-white border shadow-xl max-h-56 overflow-y-auto rounded"
                    >
                        {itemResults.map((b) => (
                            <div
                                key={b.id}
                                className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                                onClick={() => {
                                    const i = dropdown!.index;

                                    form.setValue(`items.${i}.textbookId`, b.id);
                                    form.setValue(`items.${i}.title`, b.title);
                                    form.setValue(`items.${i}.rate`, b.mrp);
                                    form.setValue(`items.${i}.stock`, b.stock);
                                    form.setValue(`items.${i}.qty`, 1);

                                    setItemResults([]);
                                    setDropdown(null);
                                }}
                            >
                                <div className="font-medium">
                                    {b.title}
                                </div>

                                <div className="text-xs text-slate-500">
                                    Class {b.class}
                                    {b.subject && ` • ${b.subject}`}
                                    {b.medium && ` • ${b.medium}`}
                                    {b.editionYear && ` • ${b.editionYear}`}
                                </div>

                                <div className="text-xs mt-1 flex justify-between">
                                    <span>Stock: {b.stock}</span>
                                    <span className="font-medium">₹{b.mrp}</span>
                                </div>

                                <div className="text-[11px] text-slate-400">
                                    Dealer: {b.dealerName}
                                </div>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
}
