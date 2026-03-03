"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";

import Spinner from "@/components/Spinner";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

import {
    useCompanyProfile,
    useCustomerReceiptPdf,
} from "@/lib/queries/company";

import { useSettingsInfo } from "@/lib/queries/settings";
import { useAuthUser } from "@/lib/queries/auth";

import { z } from "zod";
import { handleApiError } from "@/lib/utils/getApiError";
import { PaymentFormValues, paymentSchema } from "@/lib/validators/payments.schema";
import { useUpdatePayment } from "@/lib/queries/schools";

/* ======================================================
   PAGE
====================================================== */

export default function EditCompanyPaymentPage() {
    const { id, paymentId } = useParams<{
        id: string;
        paymentId: string;
    }>();

    const router = useRouter();

    const { data: company, isLoading: companyLoading } =
        useCompanyProfile(id);

    const { data: payment, isLoading: paymentLoading } = useCustomerReceiptPdf(paymentId);

    const { data: settings, isLoading: settingsLoading } = useSettingsInfo();

    const { data: user, isLoading: userLoading } = useAuthUser();

    const updatePayment = useUpdatePayment(paymentId);

    const {
        register,
        handleSubmit,
        watch,
        formState,
        reset,
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
    });

    const mode = watch("mode");

    /* ================= LOAD EXISTING DATA ================= */

    useEffect(() => {
        if (!payment) return;

        reset({
            amount: Number(payment.amount),
            mode: payment.mode,
            referenceNo: payment.referenceNo ?? "",
            note: payment.note ?? "",
            receiptNo: payment.receiptNo,
            receiptDate: new Date(payment.date).toISOString().split("T")[0],
        });
    }, [payment, reset]);

    /* ================= SUBMIT ================= */

    const submit = (data: PaymentFormValues) => {
        if (!user?.id) {
            toast.error("User not logged in");
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
                    toast.error(handleApiError(e).message),
            }
        );
    };

    if (
        companyLoading ||
        paymentLoading ||
        settingsLoading ||
        userLoading
    ) {
        return <PdfViewerLoader />;
    }

    if (!company || !payment || !settings || !user)
        return null;

    /* ======================================================
       UI
    ====================================================== */

    return (
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <form
                onSubmit={handleSubmit(submit)}
                className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden"
            >

                {/* HEADER */}
                <div className="px-6 py-6 border-b bg-gradient-to-br from-red-50 to-white text-center">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-red-800">
                        PAYMENT VOUCHER
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Update company payment
                    </p>
                </div>

                {/* META */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border-b">

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Payment No
                        </label>
                        <input
                            {...register("receiptNo")}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                        />
                        {formState.errors.receiptNo && (
                            <p className="text-xs text-red-600 mt-1">
                                {formState.errors.receiptNo.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Payment Date
                        </label>
                        <input
                            type="date"
                            {...register("receiptDate")}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* PAID TO */}
                <div className="p-5 border-b">
                    <div className="text-xs font-bold text-slate-500 underline">
                        PAID TO
                    </div>

                    <div className="text-sm font-semibold">
                        {company.name}
                    </div>
                </div>

                {/* FORM */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm font-medium">
                            Amount
                        </label>
                        <input
                            type="number"
                            min={1}
                            {...register("amount", { valueAsNumber: true })}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="
                                mt-1 w-full border rounded-md px-3 py-2
                                appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none
                            "
                        />
                        {formState.errors.amount && (
                            <p className="text-xs text-red-600 mt-1">
                                {formState.errors.amount.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Mode
                        </label>
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
                            />
                        </div>
                    )}
                </div>

                <div className="px-5 pb-5">
                    <textarea
                        {...register("note")}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Optional note"
                    />
                </div>

                {/* FOOTER */}
                <div className="px-6 py-5 text-right text-sm border-t bg-slate-50">
                    <div>
                        For <strong>{settings.name}</strong>
                    </div>
                    <div className="font-bold mt-4">
                        Authorized Signatory
                    </div>
                    <div className="text-xs text-slate-500">
                        Recorded by: {user.name}
                    </div>
                </div>

                {/* SAVE */}
                <div className="p-5">
                    <button
                        disabled={updatePayment.isPending}
                        className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                        {updatePayment.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} /> Updating...
                            </span>
                        ) : (
                            "Update Payment"
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}