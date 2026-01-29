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

import { InvoiceRow } from "@/lib/types/customer"
import Spinner from "../Spinner"

interface Props {
    open: boolean
    invoice: InvoiceRow | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function CompanyInvoiceVoidDialog({
    open,
    invoice,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!invoice) return null

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>

                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 underline underline-offset-2">
                        Void Company Invoice?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to void the company invoice
                        <strong className="mx-1">
                            {invoice.documentNo}
                        </strong>.
                        <br /><br />

                        Date:
                        <strong className="ml-1">
                            {new Date(invoice.date).toLocaleDateString()}
                        </strong>
                        <br />

                        Quantity:
                        <strong className="ml-1">
                            {invoice.totalQty}
                        </strong>
                        <br />

                        Amount:
                        <strong className="ml-1">
                            ₹{invoice.amount}
                        </strong>
                        <br />

                        Status:
                        <strong className="ml-1">
                            {invoice.status}
                        </strong>

                        <br /><br />

                        <span className="text-red-700 font-medium">
                            This action cannot be undone.
                        </span>

                        <br /><br />

                        <span className="text-slate-500">
                            The invoice will be cancelled and removed from company payables.
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
                                Voiding...
                            </span>
                        ) : (
                            "Void Invoice"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}
