"use client"

import { useMemo, useState } from "react"
import ResponsiveTable, { Column } from "@/components/ResponsiveTable"
import Pagination from "@/components/Pagination"
import { DashboardDocument, DocumentType, PartyType, } from "@/lib/types/dashboard"
import { useDashboardDocuments, useExportDocuments } from "@/lib/queries/dashboard"
import { useClientPagination } from "@/lib/hooks/useClientPagination"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { PDFDownloadLink } from "@react-pdf/renderer"
import DashboardReportPdf from "./invoices/DashboardReportPdf"
import { useSettingsInfo } from "@/lib/queries/settings"
import TableLoader from "./loaders/TableLoader"
import { exportToCSV } from "@/lib/utils/exportCsv"
import { Money } from "./Money"
import Spinner from "./Spinner"

const PAGE_SIZE = 10

const ROUTES = {
    SCHOOL: {
        INVOICE: (id: string) => `/dashboard/invoices/${id}`,
        CREDIT_NOTE: (id: string) => `/dashboard/credit/${id}`,
        PAYMENT: (id: string) => `/dashboard/payments/${id}`,
    },
    COMPANY: {
        INVOICE: (pid: string, id: string) => `/dashboard/companies/${pid}/invoices/${id}`,
        CREDIT_NOTE: (pid: string, id: string) => `/dashboard/companies/${pid}/credit/${id}`,
        PAYMENT: (pid: string, id: string) => `/dashboard/companies/${pid}/payments/${id}`,
    },
} as const

function kindBadge(kind: DashboardDocument["kind"]) {
    const map = {
        INVOICE: "bg-blue-100 text-blue-700",
        CREDIT_NOTE: "bg-amber-100 text-amber-700",
        PAYMENT: "bg-emerald-100 text-emerald-700",
    }

    return map[kind]
}

function statusBadge(status: string) {
    const map: Record<string, string> = {
        ISSUED: "bg-indigo-100 text-indigo-700",
        VOIDED: "bg-red-100 text-red-700",
        POSTED: "bg-green-100 text-green-700",
        REVERSED: "bg-rose-100 text-rose-700",
    }

    return map[status] ?? "bg-slate-100 text-slate-600"
}


export default function DocumentsDashboardPage() {
    const [party, setParty] = useState<PartyType>("SCHOOL")
    const [type, setType] = useState<DocumentType>("ALL")
    const [month, setMonth] = useState<string>("")

    const [pdfRows, setPdfRows] = useState<DashboardDocument[]>([])
    const [exportMode, setExportMode] = useState<"PDF" | "CSV" | null>(null)

    const { data, fetchNextPage, hasNextPage } = useDashboardDocuments({ party, type, month })

    const { data: settings, isLoading } = useSettingsInfo()

    const exportQuery = useExportDocuments({ party, type, month, })

    const rows: DashboardDocument[] = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

    const router = useRouter()

    const {
        page,
        setPage,
        totalPages,
        pageData,
    } = useClientPagination<DashboardDocument>({
        data: rows,
        pageSize: PAGE_SIZE,
        fetchNext: fetchNextPage,
        hasNextPage,
    })

    const handleExport = async (mode: "PDF" | "CSV") => {
        setExportMode(mode)

        const res = await exportQuery.refetch()

        if (!res.data) return

        if (mode === "PDF") setPdfRows(res.data)

        if (mode === "CSV") {
            exportToCSV(res.data)
            setExportMode(null)
        }
    }

    const columns: Column<DashboardDocument>[] = [
        {
            key: "docNo",
            header: "Doc No",
            render: (r) => (
                <div className="font-medium text-slate-800">
                    {r.docNo}
                </div>
            ),
        },

        {
            key: "kind",
            header: "Type",
            render: (r) => (
                <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${kindBadge(
                        r.kind
                    )}`}
                >
                    {r.kind.replace("_", " ")}
                </span>
            ),
        },

        {
            key: "party",
            header: party,
            render: (r) => (
                <div className="font-medium text-slate-800">
                    {r.party}
                </div>
            ),
        },

        {
            key: "date",
            header: "Date",
            render: (r) => (
                <span className="text-slate-600">
                    {new Date(r.date).toLocaleDateString("en-IN")}
                </span>
            ),
        },

        {
            key: "amount",
            header: "Amount",
            className: 'text-right',
            render: (r) => <Money amount={r.amount} />,
        },

        {
            key: "status",
            header: "Status",
            render: (r) => (
                <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge(
                        r.status
                    )}`}
                >
                    {r.status}
                </span>
            ),
        },
    ]

    if (isLoading) return <TableLoader />

    return (
        <div className="space-y-4">
            {/* FILTER TOOLBAR */}
            <div className="bg-white border rounded-xl shadow-sm p-4">
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4

                        lg:grid-cols-[1fr_auto]
                        lg:items-end
                        "
                >
                    {/* LEFT: FILTERS */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            md:grid-cols-3
                            gap-4
                        "
                    >
                        {/* PARTY */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">
                                Party
                            </label>
                            <Select
                                value={party}
                                onValueChange={(v) => setParty(v as PartyType)}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select party" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCHOOL">Schools</SelectItem>
                                    <SelectItem value="COMPANY">Companies</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* DOCUMENT */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">
                                Document
                            </label>
                            <Select
                                value={type}
                                onValueChange={(v) => setType(v as DocumentType)}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select document" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All</SelectItem>
                                    <SelectItem value="INVOICE">Invoice</SelectItem>
                                    <SelectItem value="CREDIT_NOTE">
                                        Credit Note
                                    </SelectItem>
                                    <SelectItem value="PAYMENT">Payment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* MONTH */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-600">
                                Month
                            </label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="
                                    h-10 rounded-md border border-slate-300 bg-white
                                    px-3 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                                "
                            />
                        </div>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div
                        className="
                            flex flex-col
                            sm:flex-row
                            gap-2
                            w-full
                            lg:w-auto
                            justify-end
                        "
                    >
                        {/* PDF */}
                        {pdfRows.length > 0 ? (
                            <PDFDownloadLink
                                document={
                                    <DashboardReportPdf
                                        rows={pdfRows}
                                        settings={settings!}
                                        title="DOCUMENTS REPORT"
                                    />
                                }
                                fileName="documents-report.pdf"
                                onClick={() => {
                                    // reset after download
                                    setTimeout(() => {
                                        setPdfRows([])
                                        setExportMode(null)
                                    }, 300)
                                }}
                            >
                                <Button
                                    className="
                                        h-10
                                        bg-emerald-600
                                        hover:bg-emerald-700
                                        text-white
                                        animate-bounce
                                        cursor-pointer
                                    "
                                >
                                    Download PDF
                                </Button>
                            </PDFDownloadLink>
                        ) : (
                            <Button
                                className={`h-10 ${exportQuery.isFetching ? 'cursor-not-allowed  opacity-50' : 'cursor-pointer'}`}
                                disabled={exportQuery.isFetching}
                                onClick={() => handleExport("PDF")}
                            >
                                {exportQuery.isFetching && exportMode === "PDF" ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner size={18} /> Preparing…
                                    </span>
                                ) : ("Export PDF")}
                            </Button>
                        )}

                        {/* CSV */}
                        <Button
                            variant="secondary"
                            className={`h-10 ${exportQuery.isFetching ? 'cursor-not-allowed  opacity-50' : 'cursor-pointer'}`}
                            disabled={exportQuery.isFetching}
                            onClick={() => handleExport("CSV")}
                        >
                            {exportQuery.isFetching && exportMode === "CSV" ? (
                                <span className="flex items-center gap-2">
                                    <Spinner size={18} /> Preparing…
                                </span>
                            ) : ("Export CSV")}
                        </Button>

                        {/* CLEAR */}
                        <Button
                            variant="destructive"
                            className={`h-10 ${exportQuery.isFetching ? 'cursor-not-allowed  opacity-50' : 'cursor-pointer'}`}
                            onClick={() => {
                                setMonth("")
                                setPdfRows([])
                                setExportMode(null)
                                setType('ALL')
                                setParty('SCHOOL')
                            }}
                        >
                            Reset
                        </Button>
                    </div>

                </div>
            </div>

            <ResponsiveTable
                data={pageData}
                columns={columns}
                getRowId={(r) => r.id}
                onRowClick={(r) => {
                    const path =
                        r.partyType === "SCHOOL"
                            ? ROUTES.SCHOOL[r.kind](r.id)
                            : r.partyId
                                ? ROUTES.COMPANY[r.kind](r.partyId, r.id) : null

                    if (path) router.replace(path)
                }}
            />


            <Pagination
                page={page}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                onPageChange={setPage}
            />
        </div>
    )
}