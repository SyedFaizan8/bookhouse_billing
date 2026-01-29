"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MoreVertical } from "lucide-react"

type Action = {
    label: string
    onClick: () => void
    variant?: "default" | "danger" | "warning"
}

type Props = {
    actions: Action[]
}

export default function RowActions({ actions }: Props) {
    if (!actions.length) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="
                        rounded-md p-2
                        border border-slate-200
                        hover:bg-slate-100
                        active:bg-slate-200
                        transition
                    "
                >
                    <MoreVertical size={16} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="
                    w-48
                    rounded-lg
                    border border-slate-200
                    bg-white
                    shadow-xl
                    p-1
                    "
            >
                {actions.map((action, idx) => (
                    <div key={idx}>
                        {/* divider before destructive / warning actions */}
                        {idx !== 0 && action.variant && (
                            <div className="my-1 h-px bg-slate-200" />
                        )}

                        <DropdownMenuItem
                            onClick={action.onClick}
                            className={`
                                flex items-center
                                rounded-md
                                px-2 py-1
                                text-sm
                                cursor-pointer
                                transition
                                focus:outline-none
                                ${action.variant === "danger"
                                    ? "text-rose-600 hover:bg-rose-50 focus:bg-rose-50"
                                    : action.variant === "warning"
                                        ? "text-orange-600 hover:bg-orange-50 focus:bg-orange-50"
                                        : "hover:bg-slate-100 focus:bg-slate-100"
                                }
                            `}
                        >
                            {action.label}
                        </DropdownMenuItem>
                    </div>
                ))}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
