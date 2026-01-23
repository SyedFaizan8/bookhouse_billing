// import EmptyState from "@/components/EmptyState"
// import { Bookmark } from "lucide-react"

// const Page = () => {

//     return <EmptyState
//         icon={Bookmark}
//         title="No data yet"
//         description="Once you have Data. you can check the reports"
//         actionLabel="Create Invoice"
//         actionHref="/dashboard/invoices/new"
//     />

// }

// export default Page

"use client"

import { BarChartVertical } from "@/components/charts/BarChartVertical"
import { DonutChart } from "@/components/charts/DonutChart"
import { LineTrendChart } from "@/components/charts/LineTrendChart"
import { TopCustomersChart } from "@/components/charts/TopCustomers"
import DashboardLoading from "@/components/loaders/DashboardLoader"
import PageLoader from "@/components/loaders/PageLoader"
import { inventoryHealth, monthlySales } from "@/data/dashboard"
import {
    FileText,
    LibraryBig,
    School,
    File,
    IndianRupee,
    LucideIcon,
    BookOpenIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ItemType {
    name: string
    count: number
    icon: LucideIcon
    accent?: string
    url: string
}

const Page = () => {
    const router = useRouter()

    const items: ItemType[] = [
        {
            name: "Customers (Schools)",
            count: 12,
            icon: School,
            accent: "bg-indigo-50 text-indigo-600",
            url: '/dashboard/customers'
        },
        {
            name: "Dealers (Publishers)",
            count: 12,
            icon: LibraryBig,
            accent: "bg-emerald-50 text-emerald-600",
            url: '/dashboard/dealers'
        },
        {
            name: "Invoices",
            count: 12,
            icon: FileText,
            accent: "bg-sky-50 text-sky-600",
            url: '/dashboard/invoices'
        },
        {
            name: "Estimates",
            count: 12,
            icon: File,
            accent: "bg-amber-50 text-amber-600",
            url: '/dashboard/estimates'
        },
        {
            name: "Textbooks in Inventory",
            count: 12,
            icon: BookOpenIcon,
            accent: "bg-yellow-50 text-yellow-600",
            url: '/dashboard/textbooks'
        },
        {
            name: "Amounts Due",
            count: 12,
            icon: IndianRupee,
            accent: "bg-rose-50 text-rose-600",
            url: '/dashboard'
        },
    ]

    //  <DashboardLoading /> update this later for loading
    return (
        <div className="w-full">

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-xl font-semibold text-slate-900">
                    Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Overview of your business activity
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {items.map((item, i) => {
                    const Icon = item.icon

                    return (
                        <Link
                            key={i}
                            href={item.url}
                            className={`
                                    bg-white rounded-md p-5
                                    shadow-sm hover:shadow-md transition
                                    cursor-pointer hover:font-bold
                                `}
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-3xl font-semibold text-slate-900">
                                        {item.count}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.name}
                                    </p>
                                </div>

                                <div
                                    className={`
                                        h-11 w-11 flex items-center justify-center
                                        rounded-full ${item.accent}
                                    `}
                                >
                                    <Icon size={22} />
                                </div>

                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Charts */}
            <div className="mb-6 space-y-6">

                {/* Top row */}
                <div className="grid grid-cols-1 gap-6">
                    <LineTrendChart
                        title="Monthly Sales"
                        data={monthlySales.map(m => ({
                            label: m.month,
                            value: m.sales,
                        }))}
                    />

                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DonutChart
                        title="Outstanding Amount"
                        data={[
                            { name: "Paid", value: 1850000 },
                            { name: "Pending", value: 420000 },
                        ]}
                    />
                    <TopCustomersChart />
                </div>

            </div>

        </div>
    )
}

export default Page
