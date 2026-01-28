"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { useCustomerReceiptPdf } from "@/lib/queries/company";
import CompanyPaymentPdf from "@/components/invoices/CompanyPaymentPdf";
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
    const { paymentId } = useParams<{ paymentId: string }>();

    const { data, isLoading } = useCustomerReceiptPdf(paymentId);
    const { data: settings, isLoading: settingsLoadding } = useSettingsInfo()

    if (isLoading || settingsLoadding) return <PdfViewerLoader />;
    if (!data || !settings) return null;

    return (
        <div className="min-h-screen space-y-4">

            {/* HEADER */}
            <div className="flex justify-end">
                <PDFDownloadLink
                    document={<CompanyPaymentPdf data={data} settings={settings} />}
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
                    <CompanyPaymentPdf data={data} settings={settings} />
                </PDFViewer>
            </div>

            {/* MOBILE */}
            <div className="md:hidden text-center text-sm text-slate-500">
                Use “Download Receipt” to view PDF
            </div>
        </div>
    );
}
