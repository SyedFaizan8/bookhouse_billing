"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import ReceiptPdf from "@/components/pdf/ReceiptPdf";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { useSchoolReceiptPdf } from "@/lib/queries/schools";
import WhatsAppButton from "@/components/WhatsappButton";
import { ArrowLeft } from "lucide-react";
import { useSettingsInfo } from "@/lib/queries/settings";

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

    const { data, isLoading } = useSchoolReceiptPdf(id);
    const { data: settings, isLoading: settingsLoading } = useSettingsInfo()

    const router = useRouter()

    if (isLoading || settingsLoading) return <PdfViewerLoader />;
    if (!data || !settings) return null;

    return (
        <div className="min-h-screen space-y-4">
            <div className="flex justify-between">

                <WhatsAppButton />

                {/* BACK */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm rounded hover:bg-slate-100"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <PDFDownloadLink
                    document={<ReceiptPdf data={data} settings={settings} />}
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
                    <ReceiptPdf data={data} settings={settings} />
                </PDFViewer>
            </div>

            {/* MOBILE */}
            <div className="md:hidden text-center text-sm text-slate-500">
                Use “Download Receipt” to view PDF
            </div>
        </div>
    );
}
