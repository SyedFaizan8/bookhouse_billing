"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useReceiptPdf } from "@/lib/queries/payments";
import ReceiptPdf from "@/components/pdf/ReceiptPdf";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { useCompanyInfo } from "@/lib/queries/company";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    { ssr: false }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
    { ssr: false }
);

export default function ReceiptViewPage() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading } = useReceiptPdf(id);

    if (isLoading) return <PdfViewerLoader />;
    if (!data) return null;

    return (
        <div className="min-h-screen space-y-4">

            {/* HEADER */}
            <div className="flex justify-end">
                <PDFDownloadLink
                    document={<ReceiptPdf data={data} />}
                    fileName={`${data.receiptNo}.pdf`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    {({ loading }) =>
                        loading ? "Preparing PDF..." : "Download Receipt"
                    }
                </PDFDownloadLink>
            </div>

            {/* VIEWER */}
            <div className="h-[90vh] border rounded bg-white hidden md:block">
                <PDFViewer width="100%" height="100%">
                    <ReceiptPdf data={data} />
                </PDFViewer>
            </div>

            {/* MOBILE */}
            <div className="md:hidden text-center text-sm text-slate-500">
                Use “Download Receipt” to view PDF
            </div>
        </div>
    );
}
