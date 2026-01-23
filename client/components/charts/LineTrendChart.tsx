import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts"
import ChartCard from "./ChartCard"
import { currency } from "@/lib/utils/formatters"

type Props = {
    title: string
    data: { label: string; value: number }[]
    valueLabel?: string
}

export function LineTrendChart({
    title,
    data,
    valueLabel = "Amount",
}: Props) {
    return (
        <ChartCard title={title}>
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={currency} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
    )
}
