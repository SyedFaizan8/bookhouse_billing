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
import { PaymentRow } from "@/lib/types/payments"
import { Money } from "../Money"

type PaymentType = "SCHOOL" | "COMPANY"

interface Props {
    open: boolean
    type: PaymentType
    payment: PaymentRow | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function PaymentDeleteDialog({
    open,
    type,
    payment,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!payment) return null

    const label = type === "SCHOOL" ? "School Payment" : "Company Payment"

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent
                className="
          w-[95%]
          sm:max-w-md
          md:max-w-lg
          rounded-xl
          p-5 sm:p-6
          max-h-[85vh]
          overflow-y-auto
        "
            >
                <AlertDialogHeader className="space-y-3">

                    <AlertDialogTitle className="text-red-600 text-base sm:text-lg md:text-xl font-semibold">
                        Delete {label}?
                    </AlertDialogTitle>

                    <AlertDialogDescription asChild>
                        <div className="text-sm sm:text-base text-slate-600 space-y-4">

                            <p className="leading-relaxed">
                                You are about to permanently delete payment
                                <strong className="ml-1 text-slate-900 break-all">
                                    {payment.receiptNo}
                                </strong>
                            </p>

                            {/* Info Box */}
                            <div className="bg-slate-50 p-4 rounded-lg border space-y-3 text-sm">

                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium text-right">
                                        {new Date(payment.date).toLocaleDateString("en-IN")}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Mode</span>
                                    <span className="font-medium text-right">
                                        {payment.mode}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Amount</span>
                                    <span className="font-semibold text-right">
                                        <Money amount={payment.amount} />
                                    </span>
                                </div>

                            </div>

                            <p className="text-red-600 font-medium">
                                This action cannot be undone.
                            </p>

                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                The payment will be permanently removed from {type === "SCHOOL" ? "school" : "company"} statements and financial records.
                            </p>

                        </div>
                    </AlertDialogDescription>

                </AlertDialogHeader>

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
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={16} />
                                Deleting...
                            </span>
                        ) : (
                            "Delete Payment"
                        )}
                    </AlertDialogAction>

                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}