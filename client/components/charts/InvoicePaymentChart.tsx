"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

export function InvoicePaymentChart({ data }: { data: any[] }) {
    return (
        <div className="bg-white rounded-2xl p-6 ring-1 ring-black/5">
            <h3 className="font-semibold text-slate-800 mb-4">
                Monthly School (Invoice vs Payment)
            </h3>

            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            formatter={(value, name) => {
                                if (typeof value !== "number") return value

                                return [
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xs text-slate-500">₹</span>
                                        <span className="font-semibold text-slate-800">
                                            {value.toLocaleString("en-IN")}
                                        </span>
                                    </span>,
                                    name === "invoice" ? "Invoice Amount" : "Payment Amount",
                                ]
                            }} />
                        <Line
                            type="monotone"
                            dataKey="invoice"
                            stroke="#4f46e5"
                            strokeWidth={3}
                        />
                        <Line
                            type="monotone"
                            dataKey="payment"
                            stroke="#16a34a"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
