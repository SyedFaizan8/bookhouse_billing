"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDealerPayment } from "@/lib/queries/dealers";

const Schema = z.object({
    date: z.string(),
    amount: z.number().positive(),
    mode: z.enum(["CASH", "UPI", "BANK"]),
    note: z.string().optional(),
});

type Form = z.infer<typeof Schema>;

export default function DealerPaymentsPage() {
    const { id } = useParams<{ id: string }>();
    const mutation = useCreateDealerPayment(id);

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            date: new Date().toISOString().substring(0, 10),
            amount: 0,
            mode: "CASH",
        },
    });

    return (
        <div className="space-y-6 max-w-lg">
            <h2 className="text-lg font-semibold">Company Payment</h2>

            <input
                type="date"
                {...form.register("date")}
                className="border rounded px-3 py-2 w-full"
            />

            <input
                type="number"
                min={1}
                {...form.register("amount", { valueAsNumber: true })}
                className="border rounded px-3 py-2 w-full"
                placeholder="Amount"
            />

            <select
                {...form.register("mode")}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank</option>
            </select>

            <textarea
                {...form.register("note")}
                className="border rounded px-3 py-2 w-full"
                placeholder="Note (optional)"
            />

            <button
                disabled={mutation.isPending}
                onClick={form.handleSubmit((d) => mutation.mutate(d))}
                className="bg-indigo-700 text-white px-6 py-3 rounded disabled:opacity-60"
            >
                {mutation.isPending ? "Saving..." : "Save Payment"}
            </button>
        </div>
    );
}
