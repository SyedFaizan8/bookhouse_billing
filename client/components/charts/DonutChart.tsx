import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import ChartCard from "./ChartCard"
import { currency } from "@/lib/utils/formatters"

const COLORS = ["#22c55e", "#f97316", "#ef4444"]

type Props = {
    title: string
    data: { name: string; value: number }[]
}

export function DonutChart({ title, data }: Props) {
    return (
        <ChartCard title={title}>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={currency} />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex justify-center gap-4 text-sm">
                {data.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {d.name}
                    </span>
                ))}
            </div>
        </ChartCard>
    )
}
