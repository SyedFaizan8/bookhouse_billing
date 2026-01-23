"use client";

import { useParams, useRouter } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import FormLoader from "@/components/loaders/FormLoader";
import TextbookForm from "@/components/TextbookForm";

import { useTextbook, useUpdateTextbook } from "@/lib/queries/inventory";
import { toast } from "sonner";

export default function EditTextbookPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading } = useTextbook(id);
    const update = useUpdateTextbook();

    if (isLoading) return <FormLoader />;
    if (!data) return null;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Inventory", href: "/dashboard/inventory" },
                    { label: "Edit" },
                ]}
            />

            <h1 className="text-xl font-semibold">Edit Textbook</h1>

            <TextbookForm
                defaultValues={{
                    title: data.title,
                    class: data.class,
                    subject: data.subject,
                    medium: data.medium,
                    editionYear: data.editionYear,
                    mrp: data.mrp,
                }}
                onSubmit={(values: any) =>
                    update.mutate(
                        { id, data: values },
                        {
                            onSuccess: () => {
                                toast.success("textbook updated successfully")
                                router.push("/dashboard/inventory")
                            }
                        }
                    )
                }
            />
        </div>
    );
}
