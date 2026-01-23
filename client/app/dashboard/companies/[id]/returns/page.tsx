"use client";

import { useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDealerReturn } from "@/lib/queries/dealers";
import { useAuthUser } from "@/lib/queries/auth";

const ItemSchema = z.object({
    textbookId: z.string(),
    qty: z.number().int().positive(),
});

const Schema = z.object({
    date: z.string(),
    items: z.array(ItemSchema).min(1),
    notes: z.string().optional(),
    recordedByUserId: z.string()
});

type Form = z.infer<typeof Schema>;

export default function DealerReturnsPage() {
    const { id } = useParams<{ id: string }>();
    const mutation = useCreateDealerReturn(id);
    const { data: user } = useAuthUser()

    const form = useForm<Form>({
        resolver: zodResolver(Schema),
        defaultValues: {
            date: new Date().toISOString(),
            items: [{ textbookId: "", qty: 1 }],
            recordedByUserId: user?.id
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Return to Company</h2>

            <input
                type="date"
                {...form.register("date")}
                className="border rounded px-3 py-2 text-sm"
            />

            {fields.map((f, i) => (
                <div key={f.id} className="flex gap-3">
                    <input
                        placeholder="Textbook ID"
                        {...form.register(`items.${i}.textbookId`)}
                        className="border rounded px-3 py-2 flex-1"
                    />
                    <input
                        type="number"
                        min={1}
                        {...form.register(`items.${i}.qty`, { valueAsNumber: true })}
                        className="border rounded px-3 py-2 w-24"
                    />
                    <button onClick={() => remove(i)}>✕</button>
                </div>
            ))}

            <button
                type="button"
                onClick={() => append({ textbookId: "", qty: 1 })}
                className="text-indigo-700 text-sm"
            >
                + Add Item
            </button>

            <textarea
                {...form.register("notes")}
                className="w-full border rounded p-2"
                placeholder="Notes (optional)"
            />

            <button
                onClick={form.handleSubmit((d) => mutation.mutate(d))}
                className="bg-indigo-700 text-white px-6 py-3 rounded"
            >
                Return to Company
            </button>
        </div>
    );
}
