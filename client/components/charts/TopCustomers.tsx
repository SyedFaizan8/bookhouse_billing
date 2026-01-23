import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { topCustomers } from "@/data/dashboard"

export function TopCustomersChart() {
    return (
        <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Top Customers
            </h3>

            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCustomers} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={140} />
                    <Tooltip formatter={(value) =>
                        typeof value === "number"
                            ? `₹${value.toLocaleString()}`
                            : "₹0"
                    } />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
