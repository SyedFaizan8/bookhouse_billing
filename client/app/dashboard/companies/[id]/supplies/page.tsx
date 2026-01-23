"use client"

import { useParams } from "next/navigation"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useCreateDealerSupply } from "@/lib/queries/dealers"
import { useAuthUser } from "@/lib/queries/auth"
import { toast } from "sonner"

/* ================= SCHEMA ================= */

const ItemSchema = z.object({
    textbookId: z.string().optional(),
    title: z.string().min(1),
    class: z.string().min(1),
    mrp: z.number().positive(),
    qty: z.number().int().positive(),
})

const Schema = z.object({
    dealerInvoiceNo: z.string().min(1),
    invoiceDate: z.string(),
    notes: z.string().optional(),
    items: z.array(ItemSchema).min(1),
})

type Form = z.infer<typeof Schema>

/* ================= PAGE ================= */

export default function DealerSuppliesPage() {
    const { id } = useParams<{ id: string }>()
    const mutation = useCreateDealerSupply(id)
    const { data: user } = useAuthUser()

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            dealerInvoiceNo: "",
            invoiceDate: new Date().toISOString().substring(0, 10),
            items: [{ title: "", class: "", mrp: 0, qty: 1 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const items = useWatch({ control: form.control, name: "items" }) || []

    /* ================= TOTALS ================= */

    const totals = useMemo(() => {
        let qty = 0
        let amount = 0
        items.forEach((i) => {
            qty += i.qty || 0
            amount += (i.qty || 0) * (i.mrp || 0)
        })
        return { qty, amount }
    }, [items])

    /* ================= SEARCH ================= */

    const [results, setResults] = useState<any[]>([])
    const [dropdown, setDropdown] = useState<any>(null)

    const searchTextbook = async (q: string) => {
        if (q.length < 2) return setResults([])
        const r = await fetch(
            `/api/billing/selection/textbooks?search=${q}`
        )
        setResults(await r.json())
    }

    /* ================= SUBMIT ================= */

    const submit = (data: Form) => {
        const newData = { ...data, recordedByUserId: user?.id! }
        mutation.mutate(newData, {
            onSuccess: () => form.reset(),
            onError: (e) => toast.error(e.message)
        })
    }

    /* ================= UI ================= */

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Company Supplies</h2>

            {/* META */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                    {...form.register("dealerInvoiceNo")}
                    placeholder="Company Invoice No *"
                    className="border rounded px-3 py-2 text-sm"
                />

                <input
                    type="date"
                    {...form.register("invoiceDate")}
                    className="border rounded px-3 py-2 text-sm"
                />
            </div>

            {/* ITEMS */}
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <table className="min-w-[1100px] w-full text-sm border">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-2 w-10">#</th>
                            <th className="p-2 text-left">Title *</th>
                            <th className="p-2 w-24">Class *</th>
                            <th className="p-2 w-20">Qty *</th>
                            <th className="p-2 w-28 text-right">MRP *</th>
                            <th className="p-2 w-28 text-right">Amount</th>
                            <th className="p-2 w-8" />
                        </tr>
                    </thead>

                    <tbody>
                        {fields.map((f, i) => {
                            const amt =
                                (items[i]?.qty || 0) * (items[i]?.mrp || 0)

                            return (
                                <tr key={f.id} className="border-t">
                                    <td className="p-2 text-center">{i + 1}</td>

                                    <td className="p-2 relative">
                                        <input
                                            className="w-full border-b focus:outline-none"
                                            {...form.register(`items.${i}.title`)}
                                            onChange={(e) => {
                                                searchTextbook(e.target.value)
                                                const r =
                                                    e.currentTarget.getBoundingClientRect()
                                                setDropdown({
                                                    index: i,
                                                    top: r.bottom + window.scrollY,
                                                    left: r.left + window.scrollX,
                                                    width: r.width,
                                                })
                                            }}
                                        />
                                    </td>

                                    <td className="p-2">
                                        <input
                                            className="w-full border rounded text-center"
                                            {...form.register(`items.${i}.class`)}
                                        />
                                    </td>

                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-full border rounded text-center"
                                            {...form.register(`items.${i}.qty`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </td>

                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full border rounded text-right"
                                            {...form.register(`items.${i}.mrp`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </td>

                                    <td className="p-2 text-right font-medium">
                                        ₹{amt.toFixed(2)}
                                    </td>

                                    <td className="p-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(i)}
                                            className="text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <button
                type="button"
                onClick={() =>
                    append({ title: "", class: "", mrp: 0, qty: 1 })
                }
                className="text-indigo-700 text-sm"
            >
                + Add textbook
            </button>

            {/* TOTAL */}
            <div className="flex justify-end">
                <div className="w-full sm:w-80 bg-slate-50 border rounded p-4 text-sm">
                    <div className="flex justify-between">
                        <span>Total Qty</span>
                        <span>{totals.qty}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span>₹{totals.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <textarea
                {...form.register("notes")}
                className="w-full border rounded p-2 text-sm"
                placeholder="Notes (optional)"
            />

            <button
                disabled={mutation.isPending}
                onClick={form.handleSubmit(submit)}
                className="w-full sm:w-auto bg-indigo-700 hover:bg-indigo-800 disabled:opacity-60 text-white px-8 py-3 rounded-lg"
            >
                {mutation.isPending ? "Saving..." : "Save Supply"}
            </button>

            {/* DROPDOWN */}
            {dropdown &&
                results.length > 0 &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            top: dropdown.top,
                            left: dropdown.left,
                            width: dropdown.width,
                        }}
                        className="bg-white border shadow-xl max-h-56 overflow-y-auto rounded z-50"
                    >
                        {results.map((b) => (
                            <div
                                key={b.id}
                                className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                                onClick={() => {
                                    const i = dropdown.index
                                    form.setValue(`items.${i}.textbookId`, b.id)
                                    form.setValue(`items.${i}.title`, b.title)
                                    form.setValue(`items.${i}.class`, b.class)
                                    form.setValue(`items.${i}.mrp`, Number(b.mrp))
                                    setResults([])
                                    setDropdown(null)
                                }}
                            >
                                <div className="font-medium">{b.title}</div>
                                <div className="text-xs text-gray-500">
                                    Class {b.class} • ₹{b.mrp}
                                </div>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    )
}
