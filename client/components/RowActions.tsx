"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { MoreVertical } from "lucide-react"

type Props = {
    open: boolean
    onOpen: () => void
    onClose: () => void
    onEdit?: () => void
    onDeactivate?: () => void
    dType?: "Deactivate" | "Close"
}

export default function RowActions({
    open,
    onOpen,
    onClose,
    onEdit,
    onDeactivate,
    dType = "Deactivate"
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    // Calculate position relative to viewport
    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setPos({
                top: rect.bottom + 6,
                left: rect.right - 140, // menu width
            })
        }
    }, [open])

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                !buttonRef.current?.contains(e.target as Node)
            ) {
                onClose()
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClick)
        }

        return () => document.removeEventListener("mousedown", handleClick)
    }, [open, onClose])

    return (
        <>
            {/* Trigger */}
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation()
                    open ? onClose() : onOpen()
                }}
                className="rounded-md p-2 hover:bg-slate-200"
            >
                <MoreVertical size={16} />
            </button>

            {/* Menu via Portal */}
            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[9999] w-32 rounded-md bg-white shadow-lg ring-1 ring-black/5"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100"
                            >
                                Edit
                            </button>
                        )}

                        {onDeactivate && (
                            <button
                                onClick={onDeactivate}
                                className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                            >
                                {dType}
                            </button>
                        )}
                    </div>,
                    document.body
                )}
        </>
    )
}
