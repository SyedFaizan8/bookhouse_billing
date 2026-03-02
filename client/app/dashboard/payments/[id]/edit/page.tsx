"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";

import Spinner from "@/components/Spinner";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

import { useSchoolReceiptPdf, useUpdatePayment } from "@/lib/queries/schools";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useAuthUser } from "@/lib/queries/auth";

import {
    paymentSchema,
    PaymentFormValues,
} from "@/lib/validators/payments.schema";

import { handleApiError } from "@/lib/utils/getApiError";

export default function EditSchoolPaymentPage() {
    const { id } = useParams<{ id: string }>(); // payment id
    const router = useRouter();

    const { data: payment, isLoading } = useSchoolReceiptPdf(id);
    const { data: company } = useSettingsInfo();
    const { data: user } = useAuthUser();

    const updatePayment = useUpdatePayment(id);

    const {
        register,
        handleSubmit,
        watch,
        formState,
        reset,
        setError,
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
    });

    const mode = watch("mode");

    /* ================= LOAD EXISTING ================= */

    useEffect(() => {
        if (!payment) return;

        reset({
            amount: Number(payment.amount),
            mode: payment.mode,
            referenceNo: payment.note ?? "",
            note: payment.note ?? "",
            receiptNo: payment.receiptNo,
            receiptDate: new Date(payment.date)
                .toISOString()
                .split("T")[0],
        });
    }, [payment, reset]);

    /* ================= SUBMIT ================= */

    const submit = (data: PaymentFormValues) => {
        if (data.amount <= 0) {
            toast.warning("Amount must be greater than zero");
            return;
        }

        if (data.mode === "BANK" && !data.referenceNo?.trim()) {
            toast.warning("Reference number required for bank payment");
            return;
        }

        updatePayment.mutate(
            {
                amount: data.amount,
                mode: data.mode,
                referenceNo: data.referenceNo?.trim() || null,
                note: data.note?.trim() || null,
                receiptNo: data.receiptNo?.trim(),
                paymentDate: data.receiptDate,
            },
            {
                onSuccess: () => {
                    toast.success("Payment updated successfully");
                    router.back();
                },
                onError: (e) =>
                    toast.error(handleApiError(e, { setError }).message),
            }
        );
    };

    if (isLoading || !payment || !company || !user)
        return <PdfViewerLoader />;

    /* ================= UI ================= */

    return (
        <div className="py-4">
            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm rounded hover:bg-slate-100 mb-4"
            >
                <ArrowLeft size={16} />
                Back
            </button>

            <form
                onSubmit={handleSubmit(submit)}
                className="mx-auto bg-white shadow-2xl p-8 rounded-lg space-y-6"
            >
                {/* HEADER */}
                <div className="text-center">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <span>Receipt No:</span>
                            <input
                                {...register("receiptNo")}
                                className="w-32 border rounded px-2 py-1 text-center font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 md:mb-0 mb-6">
                            <span>Date:</span>
                            <input
                                type="date"
                                {...register("receiptDate")}
                                className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* LOGO */}
                    {company.logoUrl && (
                        <Image
                            src={company.logoUrl}
                            alt="Company Logo"
                            width={90}
                            height={90}
                            className="mx-auto object-contain py-2"
                        />
                    )}

                    <h1 className="text-3xl font-bold tracking-wide text-indigo-900 pt-2">
                        {company.name.toUpperCase()}
                    </h1>

                    <span className="inline-block bg-indigo-50 text-indigo-800 text-md font-bold px-6 py-1 rounded-full tracking-wide mt-4">
                        Payment Receipt
                    </span>
                </div>

                {/* SCHOOL INFO */}
                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700 underline">
                        BILL TO
                    </div>
                    <div className="font-semibold text-slate-900">
                        {payment.school.name}
                    </div>
                </div>

                {/* FORM INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Amount</label>
                        <input
                            type="number"
                            min={1}
                            {...register("amount", { valueAsNumber: true })}
                            className="mt-1 w-full border rounded-md px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Mode</label>
                        <select
                            {...register("mode")}
                            className="mt-1 w-full border rounded-md px-3 py-2"
                        >
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK">Bank / Cheque</option>
                        </select>
                    </div>

                    {mode === "BANK" && (
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium">
                                Reference No
                            </label>
                            <input
                                {...register("referenceNo")}
                                className="mt-1 w-full border rounded-md px-3 py-2"
                                placeholder="UTR / Cheque No"
                            />
                        </div>
                    )}
                </div>

                <textarea
                    {...register("note")}
                    className="w-full border p-2 text-sm rounded-md"
                    placeholder="Optional note"
                />

                {/* SIGNATURE */}
                <div className="text-right text-sm">
                    <div>
                        For <strong>{company.name}</strong>
                    </div>
                    <div className="font-bold mt-4">
                        Authorized Signatory
                    </div>
                    <div className="text-xs text-slate-500">
                        Recorded By: {user.name}
                    </div>
                </div>

                {/* SAVE */}
                <button
                    disabled={updatePayment.isPending}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg disabled:opacity-50"
                >
                    {updatePayment.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner size={18} /> Updating...
                        </span>
                    ) : (
                        "Update Payment"
                    )}
                </button>
            </form>
        </div>
    );
}