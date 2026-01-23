import EmptyState from "@/components/EmptyState"
import { File } from "lucide-react"

const Page = () => {
    return <EmptyState
        icon={File}
        title="No estimates created"
        description="Create estimates for schools before converting them into invoices."
        actionLabel="Create Estimate"
        actionHref="/dashboard/estimates/new"
    />
}

export default Page