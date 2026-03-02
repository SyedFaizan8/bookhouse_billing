import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import Spinner from "../Spinner"
import { Money } from "../Money"

type DocumentType =
    | "ESTIMATION"
    | "PACKAGE_NOTE"
    | "SCHOOL_INVOICE"
    | "COMPANY_INVOICE"
    | "SCHOOL_CREDIT_NOTE"
    | "COMPANY_CREDIT_NOTE"

interface Props {
    open: boolean
    type: DocumentType
    document: {
        documentNo: string
        date: string
        amount: number
        totalQty?: number
    } | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function DocumentDeleteDialog({
    open,
    type,
    document,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!document) return null

    const typeLabelMap: Record<DocumentType, string> = {
        ESTIMATION: "Estimation",
        PACKAGE_NOTE: "Package Note",
        SCHOOL_INVOICE: "School Invoice",
        COMPANY_INVOICE: "Company Invoice",
        SCHOOL_CREDIT_NOTE: "School Credit Note",
        COMPANY_CREDIT_NOTE: "Company Credit Note",
    }

    const label = typeLabelMap[type]

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent
                className="
                    w-[95%]
                    sm:max-w-md
                    md:max-w-lg
                    rounded-xl
                    p-6
                    "
            >
                <AlertDialogHeader className="space-y-3">

                    <AlertDialogTitle className="text-red-600 text-lg sm:text-xl font-semibold">
                        Delete {label}?
                    </AlertDialogTitle>

                    <AlertDialogDescription asChild>
                        <div className="text-sm sm:text-base text-slate-600 space-y-4">

                            <p className="leading-relaxed">
                                You are about to permanently delete
                                <strong className="mx-1 text-slate-800">
                                    {label}
                                </strong>
                                <strong className="mx-1 text-slate-900 break-all">
                                    {document.documentNo}
                                </strong>
                            </p>

                            {/* Info Box */}
                            <div className="
                                        bg-slate-50
                                        p-4
                                        rounded-lg
                                        border
                                        space-y-2
                                        text-sm
                                        ">

                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium">
                                        {new Date(document.date).toLocaleDateString("en-IN")}
                                    </span>
                                </div>

                                {document.totalQty !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Quantity</span>
                                        <span className="font-medium">
                                            {document.totalQty}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-semibold">
                                        <Money amount={document.amount} />
                                    </span>
                                </div>

                            </div>

                            <p className="text-red-600 font-medium">
                                This action is permanent and cannot be undone.
                            </p>

                        </div>
                    </AlertDialogDescription>

                </AlertDialogHeader>

                {/* Responsive Footer */}
                <AlertDialogFooter
                    className="
                            flex
                            flex-col-reverse
                            sm:flex-row
                            sm:justify-end
                            gap-3
                            mt-6
                        "
                >
                    <AlertDialogCancel
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="
                            w-full
                            sm:w-auto
                            bg-red-600
                            hover:bg-red-700
                        "
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={16} />
                                Deleting...
                            </span>
                        ) : (
                            `Delete ${label}`
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}