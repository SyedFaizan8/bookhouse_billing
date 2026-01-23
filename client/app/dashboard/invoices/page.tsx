// "use client"
// import EmptyState from "@/components/EmptyState"
// import { FileText } from "lucide-react"
// import { useState } from "react"
// import Link from "next/link"
// import { Plus } from "lucide-react"
// import InvoiceTable from "@/components/invoices/InvoiceTable"
// import Breadcrumbs from "@/components/Breadcrumbs"
// import { invoicesData } from "@/data/invoices"

import EmptyState from "@/components/EmptyState"
import { FileText } from "lucide-react"

// export default function InvoicesPage() {
//     const [filter, setFilter] = useState<"ALL" | "DRAFT" | "SENT" | "DUE">("ALL")

//     const filtered =
//         filter === "ALL"
//             ? invoicesData
//             : invoicesData.filter(i => i.status === filter)

// return <EmptyState
//     icon={FileText}
//     title="No invoices yet"
//     description="Once you generate invoices, they will appear here for tracking and payment."
//     actionLabel="Create Invoice"
//     actionHref="/dashboard/invoices/new"
// />


//     return (
//         <div className="space-y-6">

//             <Breadcrumbs
//                 items={[
//                     { label: "Dashboard", href: "/dashboard" },
//                     { label: "Invoices" },
//                 ]}
//             />

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row justify-between gap-4">
//                 <div className="flex gap-2">
//                     {["ALL", "DRAFT", "SENT", "DUE"].map(tab => (
//                         <button
//                             key={tab}
//                             onClick={() => setFilter(tab as any)}
//                             className={`px-3 py-1 rounded-md text-sm
//                 ${filter === tab
//                                     ? "bg-indigo-600 text-white"
//                                     : "bg-slate-100 text-slate-600"}
//               `}
//                         >
//                             {tab}
//                         </button>
//                     ))}
//                 </div>

//                 <Link
//                     href="/dashboard/invoices/new"
//                     className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md"
//                 >
//                     <Plus size={18} />
//                     New Invoice
//                 </Link>
//             </div>

//             <InvoiceTable data={filtered} />

//         </div>
//     )
// }

export default function Page() {


    return <EmptyState
        icon={FileText}
        title="No invoices yet"
        description="Once you generate invoices, they will appear here for tracking and payment."
        actionLabel="Create Invoice"
        actionHref="/dashboard/invoices/new"
    />
}
