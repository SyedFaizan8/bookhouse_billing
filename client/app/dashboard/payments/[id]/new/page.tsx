"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

import { useCreateSchoolPayment, useSchoolProfile } from "@/lib/queries/schools";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useAuthUser } from "@/lib/queries/auth";

import {
    paymentSchema,
    PaymentFormValues,
} from "@/lib/validators/payments.schema";
import { useNextPaymentNumber } from "@/lib/queries/nextNumber";
import { useEffect } from "react";
import { handleApiError } from "@/lib/utils/getApiError";

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export default function NewPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: school, isLoading: schoolLoading } = useSchoolProfile(id);

    const { data: company, isLoading: companyLoading } = useSettingsInfo();

    const { data: user, isLoading: userLoading } = useAuthUser();

    const { data: receiptNo, isLoading: receiptLoading } = useNextPaymentNumber();

    const createPayment = useCreateSchoolPayment(id);

    const {
        register,
        handleSubmit,
        watch,
        formState,
        setValue,
        setError
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            mode: "CASH",
            referenceNo: "",
            note: "",
            receiptNo: ""
        },
    });

    const mode = watch("mode");

    useEffect(() => {
        if (receiptNo?.nextNumber) {
            setValue(
                "receiptNo",
                String(receiptNo.nextNumber)
            );
        }
    }, [receiptNo]);

    /* ======================================================
       SUBMIT
    ====================================================== */

    const submit = (data: PaymentFormValues) => {
        if (data.amount <= 0) {
            toast.warning("Amount must be greater than zero");
            return;
        }

        if (data.mode === "BANK" && !data.referenceNo?.trim()) {
            toast.warning("Reference number required for bank payment");
            return;
        }

        createPayment.mutate(
            {
                amount: data.amount,
                mode: data.mode,
                referenceNo: data.referenceNo?.trim() || null,
                note: data.note?.trim() || null,
                receiptNo: data.receiptNo?.trim() || null,
                recordedByUserId: user!.id,
            },
            {
                onSuccess: () => {
                    toast.success("Payment recorded successfully");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e, { setError }).message)
            }
        );
    };

    if (
        schoolLoading ||
        companyLoading ||
        userLoading ||
        receiptLoading
    ) {
        return <PdfViewerLoader />;
    }

    if (!school || !company || !user) return null;

    /* ======================================================
       UI
    ====================================================== */

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
                className="mx-auto bg-white shadow-xl p-8 rounded-lg space-y-6"
            >
                {/* HEADER */}
                <div className="text-center">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-slate-500">

                        <div className="flex items-center gap-2">
                            <span>Receipt No:</span>

                            <input
                                {...register("receiptNo")}
                                className="
                                    w-28
                                    border
                                    rounded
                                    px-2
                                    py-0.5
                                    text-center
                                    font-semibold
                                    text-slate-800
                                    focus:ring-2 focus:ring-indigo-500
                                "
                            />
                        </div>

                        <span>{formatDate()}</span>
                    </div>


                    {/* Logo */}
                    {company.logoUrl && (
                        <Image
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
                        Payment Receipt
                    </span>
                </div>

                {/* SCHOOL */}
                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700">BILL TO</div>

                    {/* School name */}
                    <div className="font-semibold text-slate-900">
                        {school.name}
                    </div>

                    {/* Contact person */}
                    {school.contactPerson && (
                        <div className="text-sm text-slate-700">
                            Attn: {school.contactPerson}
                        </div>
                    )}

                    {/* Address */}
                    {(school.street ||
                        school.town ||
                        school.district ||
                        school.state ||
                        school.pincode) && (
                            <div className="text-sm text-slate-600 leading-relaxed">
                                {[
                                    school.street,
                                    school.town,
                                    school.district,
                                    school.state,
                                    school.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}

                    {/* Phone */}
                    <div className="text-sm text-slate-700">
                        Phone: {school.phone}
                    </div>

                    {/* Email */}
                    {school.email && (
                        <div className="text-sm text-slate-600">
                            Email: {school.email}
                        </div>
                    )}

                    {/* GST */}
                    {school.gst && (
                        <div className="text-sm font-medium text-slate-700">
                            GSTIN: {school.gst}
                        </div>
                    )}
                </div>

                {/* INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm font-medium">
                            Amount
                        </label>
                        <input
                            type="number"
                            min={1}
                            {...register("amount", {
                                valueAsNumber: true,
                            })}
                            className="mt-1 w-full border rounded-md px-3 py-2 appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none"
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

                <button
                    disabled={createPayment.isPending}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg disabled:opacity-50"
                >
                    {createPayment.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <Spinner size={18} /> Saving...
                        </span>
                    ) : (
                        "Save Payment"
                    )}
                </button>
            </form>
        </div>
    );
}
