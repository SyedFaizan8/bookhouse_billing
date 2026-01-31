import { DashboardDocument } from "@/lib/types/dashboard"

export function exportToCSV(rows: DashboardDocument[]) {
    if (!rows.length) return

    const headers = [
        "Doc No",
        "Type",
        "Party",
        "Date",
        "Amount",
        "Status",
    ]

    const csvRows = [
        headers.join(","),

        ...rows.map((r) =>
            [
                r.docNo,
                r.kind,
                `"${r.party}"`,
                new Date(r.date).toLocaleDateString("en-IN"),
                r.amount,
                r.status,
            ].join(",")
        ),
    ]

    const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "documents-report.csv"
    link.click()

    URL.revokeObjectURL(url)
}
