import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import ChartCard from "./ChartCard"

type Props = {
    title: string
    data: { label: string; value: number }[]
    color?: string
}

export function BarChartVertical({
    title,
    data,
    color = "#6366f1",
}: Props) {
    return (
        <ChartCard title={title}>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                        dataKey="value"
                        fill={color}
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
    )
}
