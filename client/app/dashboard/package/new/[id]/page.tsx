"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuthUser } from "@/lib/queries/auth";
import { useSchoolProfile, useCreatePackage } from "@/lib/queries/schools";
import { useSettingsInfo } from "@/lib/queries/settings";
import { useNextPackageNumber } from "@/lib/queries/nextNumber";
import { handleApiError } from "@/lib/utils/getApiError";

import Spinner from "@/components/Spinner";
import FormLoader from "@/components/loaders/FormLoader";

/* ======================================================
   VALIDATION (PACKAGE NOTE ONLY)
====================================================== */

const ItemSchema = z.object({
    description: z.string().trim().min(1),
    class: z.string().optional(),
    company: z.string().optional(),
    quantity: z.number().int().min(1),
    rate: z.number().min(0),
});

const Schema = z.object({
    documentNo: z.string().min(1),
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

/* ======================================================
   PAGE
====================================================== */

export default function PackageCreatePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: school, isLoading } = useSchoolProfile(id);
    const { data: company } = useSettingsInfo();
    const { data: user } = useAuthUser();
    const { data: nextNumber } = useNextPackageNumber();

    const createPackage = useCreatePackage();

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            documentNo: "",
            items: [
                {
                    description: "",
                    class: "",
                    company: "",
                    quantity: 1,
                    rate: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        if (nextNumber?.nextNumber) {
            form.setValue("documentNo", String(nextNumber.nextNumber));
        }
    }, [nextNumber]);

    /* ======================================================
       SUBMIT
    ===================================================== */

    const submit = (data: Form) => {
        createPackage.mutate(
            {
                schoolId: id,
                billedByUserId: user!.id,
                notes: data.notes,
                documentNo: data.documentNo,

                items: data.items.map((i) => ({
                    description: i.description.trim(),
                    class: i.class || null,
                    company: i.company || null,
                    quantity: i.quantity,
                    unitPrice: i.rate,
                    discountPercent: 0,
                    pending: i.quantity,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Package note created");
                    router.back();
                },
                onError: (e) => toast.error(handleApiError(e).message),
            }
        );
    };

    if (isLoading || !school || !company) return <FormLoader />;

    /* ======================================================
       UI
    ===================================================== */

    return (
        <div className="py-4">

            {/* BACK */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 border px-3 py-1.5 rounded text-sm hover:bg-slate-100 mb-4"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="mx-auto bg-white shadow-2xl p-6 sm:p-8 rounded-lg space-y-6">

                {/* HEADER */}
                <div className="text-center">

                    <div className="flex justify-between text-sm text-slate-500">
                        <div>
                            Package No:
                            <input
                                {...form.register("documentNo")}
                                className="ml-2 w-24 border rounded text-center font-semibold"
                            />
                        </div>

                        <span>
                            {new Date().toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>

                    {company.logoUrl && (
                        <Image
                            src={company.logoUrl}
                            alt="logo"
                            width={100}
                            height={100}
                            className="mx-auto"
                        />
                    )}

                    <h1 className="text-2xl font-bold text-indigo-900">
                        {company.name}
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

                    <span className="inline-block bg-indigo-50 text-indigo-700 px-5 py-2 mt-2 rounded-full text-sm font-semibold">
                        PACKAGE NOTE
                    </span>
                </div>

                {/* School */}
                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700 underline">TO</div>

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

                {/* TABLE */}
                <form onSubmit={form.handleSubmit(submit)}>

                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full border text-sm">

                            <thead className="bg-indigo-50 font-semibold">
                                <tr>
                                    <th className="p-2">#</th>
                                    <th>Description</th>
                                    <th>Class</th>
                                    <th>Company</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {fields.map((f, i) => (
                                    <tr key={f.id}>

                                        <td className="text-center">{i + 1}</td>

                                        <td>
                                            <input
                                                {...form.register(`items.${i}.description`)}
                                                className="w-full border px-2"
                                            />
                                        </td>

                                        <td>
                                            <input
                                                {...form.register(`items.${i}.class`)}
                                                className="w-16 border"
                                            />
                                        </td>

                                        <td>
                                            <input
                                                {...form.register(`items.${i}.company`)}
                                                className="w-full border px-2"
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

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => remove(i)}
                                                className="text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ADD */}
                    <button
                        type="button"
                        onClick={() =>
                            append({
                                description: "",
                                class: "",
                                company: "",
                                quantity: 1,
                                rate: 0,
                            })
                        }
                        className="text-indigo-600 text-sm mt-2"
                    >
                        + Add Item
                    </button>

                    {/* NOTES */}
                    <textarea
                        {...form.register("notes")}
                        className="w-full border mt-4 p-2 text-sm"
                        placeholder="Notes"
                    />

                    {/* SAVE */}
                    <button
                        type="submit"
                        disabled={createPackage.isPending}
                        className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-lg mt-6"
                    >
                        {createPackage.isPending ? (
                            <span className="flex justify-center gap-2">
                                <Spinner size={16} /> Saving...
                            </span>
                        ) : (
                            "Create Package Note"
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}
