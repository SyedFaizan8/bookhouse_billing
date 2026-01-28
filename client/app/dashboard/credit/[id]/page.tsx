"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { useInvoicePdf } from "@/lib/queries/schools";
import { ArrowLeft } from "lucide-react";
import CreditPdf from "@/components/invoices/CreditPdf";
import WhatsAppButton from "@/components/WhatsappButton";
import { useSettingsInfo } from "@/lib/queries/settings";

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

    const router = useRouter()

    const { data, isLoading } = useInvoicePdf(id);
    const { data: settings, isLoading: loadingSettings } = useSettingsInfo()

    if (isLoading || loadingSettings) return <PdfViewerLoader />;
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
                    document={<CreditPdf data={data} settings={settings} />}
                    fileName={`${data.documentNo}.pdf`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                    {({ loading }) =>
                        loading ? "Preparing PDF..." : "Download PDF"
                    }
                </PDFDownloadLink>
            </div>

            <div className="h-[90vh] border rounded bg-white">
                <PDFViewer width="100%" height="100%">
                    <CreditPdf data={data} settings={settings} />
                </PDFViewer>
            </div>
        </div>
    );
}
