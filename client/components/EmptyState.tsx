import Link from "next/link"
import { LucideIcon } from "lucide-react"

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-10 ring-1 ring-black/5 text-center">

            {/* Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Icon size={26} />
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-slate-800">
                {title}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
                {description}
            </p>

            {/* Action */}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    )
}
