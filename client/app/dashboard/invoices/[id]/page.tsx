"use client";

import dynamic from "next/dynamic";
import InvoicePdf from "@/components/invoices/InvoicePdf";
import { useParams } from "next/navigation";
import { useInvoicePdf } from "@/lib/queries/invoice";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    { ssr: false }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
    { ssr: false }
);

export default function InvoicePdfView() {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading } = useInvoicePdf(id);

    if (isLoading) return <PdfViewerLoader />;
    if (!data) return null;

    return (
        <div className="min-h-screen space-y-4">
            <div className="flex justify-end">
                <PDFDownloadLink
                    document={<InvoicePdf data={data} />}
                    fileName={`${data.invoiceNo}.pdf`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    {({ loading }) =>
                        loading ? "Preparing PDF..." : "Download PDF"
                    }
                </PDFDownloadLink>
            </div>

            <div className="h-[90vh] border rounded bg-white">
                <PDFViewer width="100%" height="100%">
                    <InvoicePdf data={data} />
                </PDFViewer>
            </div>
        </div>
    );
}
