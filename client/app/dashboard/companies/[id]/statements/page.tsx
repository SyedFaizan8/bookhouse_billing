"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DealerStatementPDF } from "@/components/pdf/DealerStatementPDF";
import { API_BASE_URL } from "@/lib/constants";
import api from "@/lib/utils/axios";

export default function DealerStatementPage() {
    const { id } = useParams<{ id: string }>();

    const { data = [], isLoading } = useQuery({
        queryKey: ["dealer-statement", id],
        queryFn: async () => {

            const res = await api.get(`/dealer2/${id}/statement`);
            return res.data;
        },
    });

    if (isLoading) return null;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Company Statement</h2>
                    <p className="text-sm text-slate-500">
                        Supplies, returns & payments ledger
                    </p>
                </div>

                <PDFDownloadLink
                    document={
                        <DealerStatementPDF
                            dealerName="Company"
                            rows={data}
                        />
                    }
                    fileName="dealer-statement.pdf"
                    className="bg-indigo-700 text-white px-4 py-2 rounded text-sm text-center"
                >
                    Download PDF
                </PDFDownloadLink>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto bg-white rounded-xl ring-1 ring-black/5">
                <table className="min-w-[850px] w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Reference</th>
                            <th className="p-2 text-right">Debit</th>
                            <th className="p-2 text-right">Credit</th>
                            <th className="p-2 text-right">Balance</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((r: any, i: number) => (
                            <tr key={i} className="border-t">
                                <td className="p-2 whitespace-nowrap">
                                    {new Date(r.date).toLocaleDateString()}
                                </td>

                                <td className="p-2">
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium
                      ${r.type === "SUPPLY"
                                                ? "bg-blue-50 text-blue-700"
                                                : r.type === "RETURN"
                                                    ? "bg-amber-50 text-amber-700"
                                                    : "bg-green-50 text-green-700"
                                            }`}
                                    >
                                        {r.type}
                                    </span>
                                </td>

                                <td className="p-2 max-w-[220px] truncate">
                                    {r.reference}
                                </td>

                                <td className="p-2 text-right">
                                    {r.debit ? `₹${r.debit}` : "-"}
                                </td>

                                <td className="p-2 text-right">
                                    {r.credit ? `₹${r.credit}` : "-"}
                                </td>

                                <td className="p-2 text-right font-semibold">
                                    ₹{r.balance}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
