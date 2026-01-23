// "use client";

// import Image from "next/image";
// import { ArrowLeft } from "lucide-react";
// import { useParams, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";

// import { useCreatePayment, useNextPaymentReceiptNumber } from "@/lib/queries/payments";
// import { useCustomerProfile } from "@/lib/queries/customers";
// import { useCompanyInfo } from "@/lib/queries/company";
// import { useAuthUser } from "@/lib/queries/auth";
// import { PaymentFormValues, paymentSchema } from "@/lib/validators/payments.schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

// const formatDate = () =>
//     new Date().toLocaleDateString("en-GB", {
//         day: "numeric",
//         month: "long",
//         year: "numeric",
//     });

// export default function NewPaymentPage() {
//     const { id } = useParams<{ id: string }>();
//     const router = useRouter();

//     const { data: customer, isLoading: customerLoading } = useCustomerProfile(id);
//     const { data: company, isLoading: companyLoading } = useCompanyInfo();
//     const { data: user, isLoading: userLoading } = useAuthUser();
//     const { data: receiptNo, isLoading: receiptLoading } = useNextPaymentReceiptNumber()

//     const createPayment = useCreatePayment(id);

//     const form = useForm<PaymentFormValues>({
//         resolver: zodResolver(paymentSchema), defaultValues: {
//             amount: 0, mode: "CASH"
//         }
//     });

//     const mode = form.watch("mode");

//     const submit = (data: PaymentFormValues) => {
//         createPayment.mutate(
//             {
//                 ...data,
//                 recordedByUserId: user?.id!,
//             },
//             {
//                 onSuccess: () => {
//                     toast.success("Payment recorded successfully");
//                     router.push(`/dashboard/customers/${id}/payments`);
//                 },
//                 onError: (e) => {
//                     toast.error(e.message)
//                 }
//             }
//         );
//     };

//     if (customerLoading || companyLoading || userLoading || receiptLoading) return <PdfViewerLoader />

//     if (!customer || !company || !user) return null;

//     return (
//         <div className="py-4">

//             {/* BACK */}
//             <button
//                 onClick={() =>
//                     router.push(`/dashboard/customers/${id}/payments`)
//                 }
//                 className="
//                     inline-flex items-center gap-2
//                     rounded-md border border-slate-300
//                     px-3 py-1.5
//                     text-sm font-medium text-slate-700
//                     hover:bg-slate-100
//                     transition
//                     mb-4
//                 "
//             >
//                 <ArrowLeft size={16} />
//                 Back
//             </button>

//             <div className="mx-auto bg-white shadow-2xl p-8 rounded-lg space-y-6">

//                 {/* ================= HEADER ================= */}

//                 <div className="space-y-4">

//                     {/* TOP ROW */}
//                     <div className="flex justify-between text-xs sm:text-sm text-slate-600">
//                         {receiptNo && <span>{receiptNo.receiptNo}</span>}
//                         <span>{formatDate()}</span>
//                     </div>

//                     {/* LOGO + COMPANY */}
//                     <div className="text-center space-y-2">
//                         <div className="flex justify-center">
//                             <Image
//                                 src="/logo.png"
//                                 alt="logo"
//                                 width={90}
//                                 height={90}
//                                 className="object-contain"
//                             />
//                         </div>

//                         <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 tracking-wide">
//                             {company.name.toUpperCase()}
//                         </h1>

//                         <p className="text-xs sm:text-sm text-slate-600 leading-snug">
//                             {company.town}, {company.district},{" "}
//                             {company.state} – {company.pincode}
//                             <br />
//                             {company.phone}
//                             {company.email && <> • {company.email}</>} <br />
//                             {company.gst && <>GST:{company.gst}</>}
//                         </p>
//                     </div>

//                     {/* BADGE */}
//                     <div className="flex justify-center">
//                         <span className="bg-green-50 text-green-700 text-xs font-extrabold px-5 py-1.5 rounded-full">
//                             PAYMENT RECEIPT
//                         </span>
//                     </div>

//                     {/* CUSTOMER */}
//                     <div className="border rounded-md p-4 bg-slate-50">
//                         <div className="font-extrabold mb-1">
//                             PAID BY
//                         </div>

//                         <div className="text-sm text-slate-700">
//                             <div className="font-medium">
//                                 {customer.name}
//                             </div>

//                             <div className="text-xs mt-1">
//                                 {customer.phone}
//                                 {customer.gst && (
//                                     <span className="ml-3">
//                                         GSTIN: {customer.gst}
//                                     </span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ================= FORM ================= */}

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

//                     {/* AMOUNT */}
//                     <div>
//                         <label className="text-sm font-medium">
//                             Amount
//                         </label>
//                         <input
//                             min={0}
//                             type="number"
//                             {...form.register("amount", {
//                                 valueAsNumber: true,
//                             })}
//                             className="mt-1 w-full border rounded-md px-3 py-2"
//                         />
//                     </div>

//                     {/* MODE */}
//                     <div>
//                         <label className="text-sm font-medium">
//                             Payment Mode
//                         </label>
//                         <select
//                             {...form.register("mode")}
//                             className="mt-1 w-full border rounded-md px-3 py-2"
//                         >
//                             <option value="CASH">Cash</option>
//                             <option value="UPI">UPI</option>
//                             <option value="BANK">Bank / Cheque</option>
//                         </select>
//                     </div>

//                     {/* REF */}
//                     {mode === "BANK" && (
//                         <div className="sm:col-span-2">
//                             <label className="text-sm font-medium">
//                                 Reference No
//                             </label>
//                             <input
//                                 {...form.register("referenceNo")}
//                                 className="mt-1 w-full border rounded-md px-3 py-2"
//                                 placeholder="Cheque / RTGS / UTR"
//                             />
//                         </div>
//                     )}
//                 </div>

//                 {/* NOTE */}
//                 <div>
//                     <label className="text-sm font-medium">
//                         Note
//                     </label>
//                     <textarea
//                         {...form.register("note")}
//                         className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
//                         placeholder="Optional note"
//                     />
//                 </div>

//                 {/* SIGNATURE */}
//                 <div className="text-right text-sm space-y-1 pt-6">
//                     <div>
//                         For{" "}
//                         <strong>
//                             {company.name.toUpperCase()}
//                         </strong>
//                     </div>

//                     <div className="font-bold mt-4">
//                         Authorized Signatory
//                     </div>

//                     <div className="text-xs text-slate-600">
//                         Recorded By: {user.name}
//                     </div>
//                 </div>

//                 {/* FOOTER */}
//                 <p className="text-center text-xs text-slate-500 italic">
//                     This is a computer-generated payment receipt
//                 </p>

//                 {/* SAVE */}
//                 <button
//                     type="submit"
//                     onClick={form.handleSubmit(submit)}
//                     className="
//                         w-full
//                         bg-indigo-700
//                         hover:bg-indigo-800
//                         text-white
//                         py-3
//                         rounded-lg
//                         text-lg
//                         transition
//                     "
//                 >
//                     Save Payment
//                 </button>
//             </div>
//         </div>
//     );
// }

"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Spinner from "@/components/Spinner";
import {
    useCreatePayment,
    useNextPaymentReceiptNumber,
} from "@/lib/queries/payments";
import { useCustomerProfile } from "@/lib/queries/customers";
import { useCompanyInfo } from "@/lib/queries/company";
import { useAuthUser } from "@/lib/queries/auth";

import {
    paymentSchema,
    PaymentFormValues,
} from "@/lib/validators/payments.schema";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export default function NewPaymentPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: customer, isLoading: customerProfileLoading } = useCustomerProfile(id);
    const { data: company, isLoading: companyInfoLoading } = useCompanyInfo();
    const { data: user, isLoading: userAuthLoading } = useAuthUser();
    const { data: receiptNo, isLoading: receiptNumberLoading } = useNextPaymentReceiptNumber();

    const createPayment = useCreatePayment(id);

    const { watch, handleSubmit, register, formState } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            mode: "CASH",
            referenceNo: "",
            note: ""
        },
    });

    const mode = watch("mode");

    const submit = (data: PaymentFormValues) => {
        createPayment.mutate(
            {
                ...data,
                recordedByUserId: user!.id,
            },
            {
                onSuccess: () => {
                    toast.success("Payment recorded successfully");
                    router.push(
                        `/dashboard/customers/${id}/payments`
                    );
                },
                onError: (e: any) => {
                    toast.error(e.message);
                },
            }
        );
    };

    if (customerProfileLoading || companyInfoLoading || userAuthLoading || receiptNumberLoading) return <PdfViewerLoader />

    if (!customer || !company || !user) return null;

    return (
        <div className="py-4">

            {/* BACK */}
            <button
                onClick={() =>
                    router.push(
                        `/dashboard/customers/${id}/payments`
                    )
                }
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

            {/* FORM */}
            <form
                onSubmit={handleSubmit(submit)}
                className="mx-auto bg-white shadow-2xl p-8 rounded-lg space-y-6"
            >
                {/* HEADER */}
                <div className="space-y-4">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                        {receiptNo && (
                            <span>{receiptNo.receiptNo}</span>
                        )}
                        <span>{formatDate()}</span>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <Image
                                src="/logo.png"
                                alt="logo"
                                width={90}
                                height={90}
                            />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">
                            {company.name.toUpperCase()}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600">
                            {company.town}, {company.district},{" "}
                            {company.state} – {company.pincode}
                            <br />
                            {company.phone}
                            {company.gst && (
                                <>
                                    <br />
                                    GST: {company.gst}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <span className="bg-green-50 text-green-700 text-xs font-extrabold px-5 py-1.5 rounded-full">
                            PAYMENT RECEIPT
                        </span>
                    </div>

                    <div className="border rounded-md p-4 bg-slate-50">
                        <div className="font-extrabold mb-1">
                            PAID BY
                        </div>

                        <div className="text-sm">
                            <div className="font-medium">
                                {customer.name}
                            </div>
                            <div className="text-xs mt-1">
                                {customer.phone}
                            </div>
                        </div>
                    </div>
                </div>

                {/* INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">
                            Amount
                        </label>
                        <input
                            type="number"
                            min={0}
                            {...register("amount", {
                                valueAsNumber: true,
                            })}
                            className="mt-1 w-full border rounded-md px-3 py-2"
                        />
                        {formState.errors.amount && (
                            <p className="text-xs text-red-600 mt-1">
                                {
                                    formState.errors.amount.message
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Payment Mode
                        </label>
                        <select
                            {...register("mode")}
                            className="mt-1 w-full border rounded-md px-3 py-2"
                        >
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK">
                                Bank / Cheque
                            </option>
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
                                placeholder="Cheque / UTR / RTGS"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Note
                    </label>
                    <textarea
                        {...register("note")}
                        className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                        placeholder="Optional note"
                    />
                </div>

                {/* SIGNATURE */}
                <div className="text-right text-sm pt-6">
                    <div>
                        For{" "}
                        <strong>
                            {company.name.toUpperCase()}
                        </strong>
                    </div>
                    <div className="font-bold mt-4">
                        Authorized Signatory
                    </div>
                    <div className="text-xs text-slate-600">
                        Recorded By: {user.name}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 italic">
                    This is a computer-generated payment receipt
                </p>

                {/* SAVE BUTTON */}
                <button
                    type="submit"
                    disabled={createPayment.isPending}
                    className={`
                        w-full
                        flex items-center justify-center gap-2
                        py-3 rounded-lg text-lg text-white
                        transition
                        ${createPayment.isPending
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-700 hover:bg-indigo-800"
                        }
                    `}
                >
                    {createPayment.isPending && (
                        <Spinner size={18} />
                    )}
                    {createPayment.isPending
                        ? "Saving..."
                        : "Save Payment"}
                </button>
            </form>
        </div>
    );
}
