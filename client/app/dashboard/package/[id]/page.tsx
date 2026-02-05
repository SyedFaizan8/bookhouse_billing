// "use client";

// import dynamic from "next/dynamic";
// import PackagePdf from "@/components/invoices/PackagePdf";
// import { useParams, useRouter } from "next/navigation";
// import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
// import { useInvoicePdf } from "@/lib/queries/schools";
// import { ArrowLeft } from "lucide-react";
// import WhatsAppButton from "@/components/WhatsappButton";
// import { useSettingsInfo } from "@/lib/queries/settings";

// const PDFViewer = dynamic(
//     () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
//     { ssr: false }
// );

// const PDFDownloadLink = dynamic(
//     () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
//     { ssr: false }
// );

// export default function InvoicePdfView() {
//     const { id } = useParams<{ id: string }>()

//     const router = useRouter()

//     const { data, isLoading } = useInvoicePdf(id);
//     const { data: settings, isLoading: settingsLoading } = useSettingsInfo()

//     if (isLoading || settingsLoading) return <PdfViewerLoader />;
//     if (!data || !settings) return null;

//     return (
//         <div className="min-h-screen space-y-4">
//             <div className="flex justify-between">

//                 <WhatsAppButton />

//                 {/* BACK */}
//                 <button
//                     onClick={() => router.back()}
//                     className="inline-flex items-center gap-2 border px-3 py-1.5 text-sm rounded hover:bg-slate-100"
//                 >
//                     <ArrowLeft size={16} /> Back
//                 </button>

//                 <PDFDownloadLink
//                     document={<PackagePdf data={data} settings={settings} />}
//                     fileName={`${data.documentNo}.pdf`}
//                     className="bg-indigo-600 text-white px-4 py-2 rounded"
//                 >
//                     {({ loading }) => loading ? "Preparing PDF..." : "Download PDF"}
//                 </PDFDownloadLink>
//             </div>

//             <div className="h-[90vh] border rounded bg-white">
//                 <PDFViewer width="100%" height="100%">
//                     <PackagePdf data={data} settings={settings} />
//                 </PDFViewer>
//             </div>
//         </div>
//     );
// }
"use client";

import dynamic from "next/dynamic";
import PackagePdf from "@/components/invoices/PackagePdf";
import { useParams, useRouter } from "next/navigation";
import PdfViewerLoader from "@/components/loaders/PdfViewerLoader";
import { useInvoicePdf } from "@/lib/queries/schools";
import { ArrowLeft, Edit3 } from "lucide-react";
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
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading } = useInvoicePdf(id);
    const { data: settings, isLoading: settingsLoading } = useSettingsInfo();

    if (isLoading || settingsLoading) return <PdfViewerLoader />;
    if (!data || !settings) return null;

    return (
        <div className="min-h-screen space-y-4 p-3 sm:p-4">

            {/* ================= ACTION BAR ================= */}
            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                "
            >
                {/* LEFT GROUP */}
                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        flex-wrap
                        gap-2
                        w-full sm:w-auto
                    "
                >
                    <WhatsAppButton />

                    {/* UPDATE PENDING */}
                    <button
                        onClick={() => router.push(`/dashboard/package/${id}/pending`)}
                        className="
                            w-full sm:w-auto
                            inline-flex items-center justify-center gap-2
                            bg-amber-600 hover:bg-amber-700
                            text-white
                            px-4 py-2
                            rounded-md
                            text-sm font-medium
                            transition
                            shadow
                        "
                    >
                        <Edit3 size={16} />
                        Update Pending
                    </button>
                </div>

                {/* RIGHT GROUP */}
                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        flex-wrap
                        gap-2
                        w-full sm:w-auto
                    "
                >
                    {/* BACK */}
                    <button
                        onClick={() => router.back()}
                        className="
                            w-full sm:w-auto
                            inline-flex items-center justify-center gap-2
                            border
                            px-4 py-2
                            rounded-md
                            text-sm
                            hover:bg-slate-100
                            transition
                        "
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {/* DOWNLOAD */}
                    <PDFDownloadLink
                        document={<PackagePdf data={data} settings={settings} />}
                        fileName={`${data.documentNo}.pdf`}
                        className="
                            w-full sm:w-auto
                            inline-flex items-center justify-center
                            bg-indigo-600 hover:bg-indigo-700
                            text-white
                            px-4 py-2
                            rounded-md
                            text-sm
                            transition
                        "
                    >
                        {({ loading }) =>
                            loading ? "Preparing PDF..." : "Download PDF"
                        }
                    </PDFDownloadLink>
                </div>
            </div>

            {/* ================= PDF VIEWER ================= */}
            <div className="h-[85vh] sm:h-[88vh] border rounded bg-white overflow-hidden">
                <PDFViewer width="100%" height="100%">
                    <PackagePdf data={data} settings={settings} />
                </PDFViewer>
            </div>
        </div>
    );
}
