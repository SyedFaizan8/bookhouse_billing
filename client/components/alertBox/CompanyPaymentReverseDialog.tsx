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

interface Props {
    open: boolean
    payment: PaymentRow | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function CompanyPaymentReverseDialog({
    open,
    payment,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!payment) return null

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>

                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 underline underline-offset-2">
                        Reverse Company Payment?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to reverse the company payment
                        <strong className="mx-1">
                            {payment.receiptNo}
                        </strong>.
                        <br /><br />

                        Date:
                        <strong className="ml-1">
                            {new Date(payment.date).toLocaleDateString()}
                        </strong>
                        <br />

                        Mode:
                        <strong className="ml-1">
                            {payment.mode}
                        </strong>
                        <br />

                        Amount:
                        <strong className="ml-1">
                            ₹{payment.amount}
                        </strong>
                        <br />

                        Status:
                        <strong className="ml-1">
                            {payment.status}
                        </strong>

                        <br /><br />

                        <span className="text-red-700 font-medium">
                            This action cannot be undone.
                        </span>

                        <br /><br />

                        <span className="text-slate-500">
                            The payment will be reversed and removed from company statement.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner size={18} />
                                Reversing...
                            </span>
                        ) : (
                            "Reverse Payment"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}
