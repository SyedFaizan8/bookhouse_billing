"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

import { useCompanyProfile, useCreateCompanyPayment } from "@/lib/queries/company";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useAuthUser } from "@/lib/queries/auth";

import { z } from "zod";
import { handleApiError } from "@/lib/utils/getApiError";

/* ======================================================
   SCHEMA
====================================================== */

const paymentSchema = z.object({
    paymentNo: z.string().trim().min(1, "Payment number is required"),
    paymentDate: z.string().min(1, "Payment date is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    mode: z.enum(["CASH", "UPI", "BANK"]),
    referenceNo: z.string().optional(),
    note: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const today = new Date().toISOString().split("T")[0];

/* ======================================================
   PAGE
====================================================== */

export default function NewCompanyPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: company, isLoading: companyLoading } =
        useCompanyProfile(id);

    const { data: settings, isLoading: settingsLoading } =
        useSettingsInfo();

    const { data: user, isLoading: userLoading } =
        useAuthUser();

    const createPayment = useCreateCompanyPayment(id);

    const {
        register,
        handleSubmit,
        watch,
        formState,
    } = useForm<PaymentForm>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentDate: today,
            amount: 0,
            mode: "CASH",
        },
    });

    const mode = watch("mode");

    /* ======================================================
       SUBMIT
    ====================================================== */

    const submit = (data: PaymentForm) => {
        if (!user?.id) {
            toast.error("User not logged in");
            return;
        }

        if (data.mode === "BANK" && !data.referenceNo?.trim()) {
            toast.warning("Reference number required for bank payment");
            return;
        }

        createPayment.mutate(
            {
                paymentNo: data.paymentNo.trim(),
                paymentDate: data.paymentDate,
                amount: data.amount,
                mode: data.mode,
                referenceNo: data.referenceNo?.trim() || null,
                note: data.note?.trim() || null,
                recordedByUserId: user.id,
            },
            {
                onSuccess: () => {
                    toast.success("Payment recorded successfully");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    if (companyLoading || settingsLoading || userLoading) {
        return <PdfViewerLoader />;
    }

    if (!company || !settings || !user) return null;

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
                        Payment made to company
                    </p>
                </div>

                {/* META */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border-b">

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Payment No
                        </label>
                        <input
                            {...register("paymentNo")}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                            placeholder="Enter payment number"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600">
                            Payment Date
                        </label>
                        <input
                            type="date"
                            max={today}
                            {...register("paymentDate")}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* PAID TO */}
                <div className="p-5 border-b">
                    <div className="text-xs font-bold text-slate-500 underline ">
                        PAID TO
                    </div>
                    <div className="text-sm font-semibold">
                        {company.name}
                    </div>

                    {/* Address */}
                    {(company.street ||
                        company.town ||
                        company.district ||
                        company.state ||
                        company.pincode) && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                                {[
                                    company.street,
                                    company.town,
                                    company.district,
                                    company.state,
                                    company.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}

                    {/* Phone */}
                    <div className="text-xs font-bold text-slate-500">
                        Phone: {company.phone}
                    </div>

                    {/* Email */}
                    {company.email && (
                        <div className="text-xs text-slate-600">
                            Email: {company.email}
                        </div>
                    )}

                    {/* GST */}
                    {company.gst && (
                        <div className="text-xs font-medium text-slate-700">
                            GSTIN: {company.gst}
                        </div>
                    )}
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
                            className="mt-1 w-full border rounded-md px-3 py-2 appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none"
                        />
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
                                placeholder="UTR / Cheque No"
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

                {/* SIGNATURE */}
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
                        disabled={createPayment.isPending}
                        className="
                            w-full
                            bg-red-700 hover:bg-red-800
                            text-white
                            py-3
                            rounded-xl
                            font-semibold
                            disabled:opacity-50
                        "
                    >
                        {createPayment.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} /> Saving...
                            </span>
                        ) : (
                            "Save Payment"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
