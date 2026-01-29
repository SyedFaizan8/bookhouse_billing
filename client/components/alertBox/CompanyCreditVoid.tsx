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
    creditNote: InvoiceRow | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function CompanyCreditNoteVoidDialog({
    open,
    creditNote,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!creditNote) return null

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>

                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 underline underline-offset-2">
                        Void Company Credit Note?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to void the company credit note
                        <strong className="mx-1">
                            {creditNote.documentNo}
                        </strong>.
                        <br /><br />

                        Date:
                        <strong className="ml-1">
                            {new Date(creditNote.date).toLocaleDateString()}
                        </strong>
                        <br />

                        Quantity:
                        <strong className="ml-1">
                            {creditNote.totalQty}
                        </strong>
                        <br />

                        Credit Amount:
                        <strong className="ml-1">
                            ₹{creditNote.amount}
                        </strong>
                        <br />

                        Status:
                        <strong className="ml-1">
                            {creditNote.status}
                        </strong>

                        <br /><br />

                        <span className="text-red-700 font-medium">
                            This action cannot be undone.
                        </span>

                        <br /><br />

                        <span className="text-slate-500">
                            The credit adjustment will be reversed and added back to company payables.
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
                            "Void Credit Note"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}
