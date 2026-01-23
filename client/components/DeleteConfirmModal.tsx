"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

type Props = {
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
    setMenu: (set: string | null) => void
}

export default function DeleteConfirmModal({
    open,
    setMenu,
    title,
    description,
    confirmLabel = "Delete",
    loading = false,
    onCancel,
    onConfirm,
}: Props) {

    useEffect(() => {
        if (!open) return
        setMenu(null)

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }

        window.addEventListener("keydown", onEsc)
        return () => window.removeEventListener("keydown", onEsc)
    }, [open, onCancel])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
                    >
                        <h2 className="text-lg font-semibold">{title}</h2>

                        {description && (
                            <p className="mt-2 text-sm text-slate-600">
                                {description}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="px-4 py-2 text-sm rounded-md bg-slate-100 disabled:opacity-50 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-sm rounded-md bg-rose-600 text-white disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Processing..." : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
