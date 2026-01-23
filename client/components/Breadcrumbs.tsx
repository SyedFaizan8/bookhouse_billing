import Link from "next/link"

type Crumb = {
    label: string
    href?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav className="text-sm text-slate-500">
            {items.map((item, i) => (
                <span key={i}>
                    {item.href ? (
                        <Link href={item.href} className="hover:text-slate-900">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-slate-900">{item.label}</span>
                    )}
                    {i < items.length - 1 && " / "}
                </span>
            ))}
        </nav>
    )
}
