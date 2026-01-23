"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import StatementPdf from "@/components/pdf/CustomerStatementPDF";
import { useCustomerStatement } from "@/lib/queries/settlement";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    { ssr: false }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
    { ssr: false }
);

export default function CustomerStatementPage() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading } = useCustomerStatement(id);

    if (isLoading) return <PdfViewerLoader />;
    if (!data) return null;

    if (!data.rows.length) return (
        <EmptyState
            icon={FileText}
            title="No Statement found"
            description="Add Invoices or payments."
            actionLabel="Add Invoice"
            actionHref={`/dashboard/schools/${id}/issued`
            }
        />
    )

    return (
        <div className="space-y-4">

            <div className="flex justify-end">
                <PDFDownloadLink
                    document={<StatementPdf data={data} />}
                    fileName="customer-statement.pdf"
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    Download Statement
                </PDFDownloadLink>
            </div>

            <div className="h-[90vh] border bg-white rounded">
                <PDFViewer width="100%" height="100%">
                    <StatementPdf data={data} />
                </PDFViewer>
            </div>
        </div>
    );
}
