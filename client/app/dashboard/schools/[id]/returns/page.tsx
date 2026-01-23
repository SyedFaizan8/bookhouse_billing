"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
    SalesReturnInvoice,
    CreateSalesReturnInput,
} from "@/lib/types/returns";

import {
    useReturnInvoices,
    useCreateSalesReturn,
} from "@/lib/queries/returns";

export default function CustomerReturnsPage() {
    const { id } = useParams<{ id: string }>();

    const { data = [], isLoading } = useReturnInvoices(id);
    const createReturn = useCreateSalesReturn();

    const [selected, setSelected] = useState<SalesReturnInvoice | null>(null);
    const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

    /* ================= DERIVED HELPERS ================= */

    const issuedTotal = (inv: SalesReturnInvoice) =>
        inv.items.reduce((s, i) => s + i.issuedQty, 0);

    const returnedTotal = (inv: SalesReturnInvoice) =>
        inv.items.reduce((s, i) => s + i.alreadyReturned, 0);

    const canSubmit = useMemo(
        () => Object.values(qtyMap).some((v) => v > 0),
        [qtyMap]
    );

    if (isLoading) return null;

    /* ================= SUBMIT ================= */

    const submitReturn = () => {
        if (!selected) return;

        const items = Object.entries(qtyMap)
            .filter(([, qty]) => qty > 0)
            .map(([textbookId, qtyReturned]) => ({
                textbookId,
                qtyReturned,
            }));

        if (items.length === 0) {
            toast.error("Enter at least one return quantity");
            return;
        }

        const payload: CreateSalesReturnInput = {
            flowGroupId: selected.flowGroupId,
            provisionalInvoiceId: selected.id,
            items,
        };

        createReturn.mutate(payload, {
            onSuccess: () => {
                toast.success("Sales return recorded");
                setSelected(null);
                setQtyMap({});
            },
            onError: (e) => {
                toast.error(e.message)
            }
        });
    };

    /* ================= UI ================= */

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            <h1 className="text-xl font-semibold">Customer Returns</h1>

            {/* ================= INVOICE LIST ================= */}

            {!selected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.map((inv) => {
                        const issued = issuedTotal(inv);
                        const returned = returnedTotal(inv);

                        const percent =
                            issued === 0 ? 0 : Math.round((returned / issued) * 100);

                        return (
                            <div
                                key={inv.id}
                                onClick={() => setSelected(inv)}
                                className="cursor-pointer rounded-xl border bg-white p-4 hover:shadow transition"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-indigo-700">
                                            Invoice #{inv.invoiceNo}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(inv.date).toLocaleDateString("en-IN")}
                                        </div>
                                    </div>
                                    <span className="text-xs bg-indigo-50 text-center text-indigo-700 px-3 py-1 rounded-full">
                                        {returned}/{issued} Returned
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>

                                    <div className="text-[11px] text-slate-500 mt-1">
                                        {percent}% returned
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ================= RETURN PANEL ================= */}

            {selected && (
                <div className="bg-white border rounded-xl p-6 space-y-6">

                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold">
                            Invoice #{selected.invoiceNo}
                        </h2>

                        <button
                            onClick={() => {
                                setSelected(null);
                                setQtyMap({});
                            }}
                            className="text-sm text-slate-500 hover:text-black"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-4">
                        {selected.items.map((item) => {
                            const current = qtyMap[item.textbookId] || 0;

                            return (
                                <div
                                    key={item.textbookId}
                                    className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{item.title}</div>

                                        <div className="text-xs text-slate-500 mt-1">
                                            Issued: {item.issuedQty} • Returned:{" "}
                                            {item.alreadyReturned} • Remaining:{" "}
                                            <span className="font-medium text-indigo-700">
                                                {item.remainingQty}
                                            </span>
                                        </div>
                                    </div>

                                    {/* QTY */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="w-8 h-8 border rounded"
                                            onClick={() =>
                                                setQtyMap((m) => ({
                                                    ...m,
                                                    [item.textbookId]: Math.max(0, current - 1),
                                                }))
                                            }
                                        >
                                            −
                                        </button>

                                        <input
                                            type="number"
                                            min={0}
                                            max={item.remainingQty}
                                            value={current}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                if (v <= item.remainingQty) {
                                                    setQtyMap((m) => ({
                                                        ...m,
                                                        [item.textbookId]: v,
                                                    }));
                                                }
                                            }}
                                            className="w-16 text-center border rounded"
                                        />

                                        <button
                                            className="w-8 h-8 border rounded"
                                            onClick={() =>
                                                setQtyMap((m) => ({
                                                    ...m,
                                                    [item.textbookId]: Math.min(
                                                        item.remainingQty,
                                                        current + 1
                                                    ),
                                                }))
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SUBMIT */}
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            disabled={!canSubmit || createReturn.isPending}
                            onClick={submitReturn}
                            className="bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                        >
                            Save Return
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
