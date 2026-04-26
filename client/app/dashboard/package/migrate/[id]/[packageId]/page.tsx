"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { useSettingsInfo } from "@/lib/queries/settings";
import { useCreatePackage, useInvoicePdf } from "@/lib/queries/schools";

import Spinner from "@/components/Spinner";
import FormLoader from "@/components/loaders/FormLoader";
import { handleApiError } from "@/lib/utils/getApiError";
import { useNextPackageNumber } from "@/lib/queries/nextNumber";
import { useAuthUser } from "@/lib/queries/auth";

import { useSortableItems } from "@/lib/hooks/useSortableItems";
import SortItemsDropdown from "@/components/SortItemsDropdown";

/* ======================================================
   VALIDATION (NOW WITH PENDING)
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
   HELPERS
====================================================== */

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

/* ======================================================
   PAGE
====================================================== */

export default function EditPackagePage() {
    const { packageId, id } = useParams<{ packageId: string, id: string }>();
    const router = useRouter();

    const { data: pkg, isLoading } = useInvoicePdf(packageId);
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
            notes: "",
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    /* ======================================================
       Sorting
    ===================================================== */
    const { sortItems } = useSortableItems(form, replace);

    /* ======================================================
       LOAD EXISTING DATA
    ===================================================== */

    useEffect(() => {
        if (!pkg) return;

        if (nextNumber?.nextNumber) {
            form.setValue("documentNo", String(nextNumber.nextNumber));
        }

        form.reset({
            notes: pkg.notes ?? "",
            items: pkg.items.map((i: any) => ({
                description: i.description,
                class: i.class ?? "",
                company: i.company ?? "",
                quantity: i.quantity,
                rate: i.rate,
            })),
        });
    }, [pkg, nextNumber]);

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
                    toast.success("Package note created successfully");
                    router.back();
                },
                onError: (e) =>
                    toast.error(handleApiError(e).message),
            }
        );
    };

    if (isLoading || !pkg || !company) return <FormLoader />;

    /* ======================================================
       UI (HEADER UNCHANGED)
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

                {/* ================= HEADER (UNCHANGED) ================= */}

                <div className="text-center">

                    <div className="flex justify-between text-sm text-slate-600">
                        <div>
                            Package No:
                            <input
                                {...form.register("documentNo")}
                                className="ml-2 w-24 border rounded text-center font-semibold appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        <span>{formatDate(pkg.date)}</span>
                    </div>

                    {company.logoUrl && (
                        <Image
                            src={company.logoUrl}
                            alt="logo"
                            width={100}
                            height={100}
                            className="mx-auto py-2"
                        />
                    )}

                    <h1 className="text-3xl font-bold text-indigo-900">
                        {company.name.toUpperCase()}
                    </h1>

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

                    <span className="inline-block bg-indigo-50 text-indigo-800 px-6 py-1 rounded-full mt-3 font-semibold">
                        PACKAGE NOTE
                    </span>
                </div>

                {/* ================= SCHOOL ================= */}

                <div className="border rounded-md p-4 bg-slate-50">
                    <div className="font-bold text-slate-700 underline">TO</div>

                    {/* School name */}
                    <div className="font-semibold text-slate-900">
                        {pkg.school.name}
                    </div>

                    {/* Contact person */}
                    {pkg.school.contactPerson && (
                        <div className="text-sm text-slate-700">
                            Attn: {pkg.school.contactPerson}
                        </div>
                    )}

                    {/* Address */}
                    {(pkg.school.street ||
                        pkg.school.town ||
                        pkg.school.district ||
                        pkg.school.state ||
                        pkg.school.pincode) && (
                            <div className="text-sm text-slate-600 leading-relaxed">
                                {[
                                    pkg.school.street,
                                    pkg.school.town,
                                    pkg.school.district,
                                    pkg.school.state,
                                    pkg.school.pincode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        )}

                    {/* Phone */}
                    <div className="text-sm text-slate-700">
                        Phone: {pkg.school.phone}
                    </div>

                    {/* Email */}
                    {pkg.school.email && (
                        <div className="text-sm text-slate-600">
                            Email: {pkg.school.email}
                        </div>
                    )}

                    {/* GST */}
                    {pkg.school.gst && (
                        <div className="text-sm font-medium text-slate-700">
                            GSTIN: {pkg.school.gst}
                        </div>
                    )}
                </div>

                {/* ================= SORTING ================= */}
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
                        ]}
                    />
                </div>

                {/* ================= TABLE ================= */}

                <form onSubmit={form.handleSubmit(submit)}>

                    <div className="overflow-x-auto">

                        <table className="min-w-[980px] w-full border text-sm">

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
                                {fields.map((f, i) => {

                                    const qty = form.watch(`items.${i}.quantity`);

                                    return (
                                        <tr key={f.id} className="hover:bg-slate-50">

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
                                                    className="w-16 border text-center"
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    {...form.register(`items.${i}.company`)}
                                                    className="w-full border px-2"
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    {...form.register(`items.${i}.quantity`, {
                                                        valueAsNumber: true,
                                                    })}
                                                    className="w-16 border text-center appearance-none
                                                    [&::-webkit-inner-spin-button]:appearance-none
                                                    [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    {...form.register(`items.${i}.rate`, {
                                                        valueAsNumber: true,
                                                    })}
                                                    className="w-24 border text-right appearance-none
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
                                    );
                                })}
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
                                <Spinner size={18} /> Creating...
                            </span>
                        ) : ("Create Package Note")}
                    </button>

                </form>
            </div>
        </div>
    );
}
