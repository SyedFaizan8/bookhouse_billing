"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { ArrowLeft } from "lucide-react";
import CompanyInvoicePdf from "@/components/invoices/CompanyInvoicePdf";
import { useCompanyInvoicePdf } from "@/lib/queries/company";
import { useSettingsInfo } from "@/lib/queries/settings";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    { ssr: false }
);

const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
    { ssr: false }
);

export default function CompanyInvoicePdfView() {
    const { invoiceId } = useParams<{ invoiceId: string }>()

    const router = useRouter()

    const { data, isLoading } = useCompanyInvoicePdf(invoiceId);
    const { data: settings, isLoading: settingsLoadding } = useSettingsInfo()

    if (isLoading || settingsLoadding) return <PdfViewerLoader />;
    if (!data || !settings) return null;


    return (
        <div className="min-h-screen space-y-4">


            <div className="flex justify-between">
                {/* BACK */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm rounded hover:bg-slate-100"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <PDFDownloadLink
                    document={<CompanyInvoicePdf data={data} settings={settings} />}
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
                    <CompanyInvoicePdf data={data} settings={settings} />
                </PDFViewer>
            </div>
        </div>
    );
}
