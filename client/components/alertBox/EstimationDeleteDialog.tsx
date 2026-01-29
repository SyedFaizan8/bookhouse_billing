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
    estimation: InvoiceRow | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function EstimationDeleteDialog({
    open,
    estimation,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!estimation) return null

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>

                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 underline underline-offset-2">
                        Delete Estimation?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to permanently delete the estimation
                        <strong className="mx-1">
                            {estimation.documentNo}
                        </strong>.
                        <br /><br />

                        Date:
                        <strong className="ml-1">
                            {new Date(estimation.date).toLocaleDateString("en-IN")}
                        </strong>
                        <br />

                        Quantity:
                        <strong className="ml-1">
                            {estimation.totalQty}
                        </strong>
                        <br />

                        Estimated Amount:
                        <strong className="ml-1">
                            ₹{estimation.amount}
                        </strong>

                        <br /><br />

                        <span className="text-red-700 font-medium">
                            This action is permanent and cannot be undone.
                        </span>

                        <br /><br />

                        <span className="text-slate-500">
                            The estimation and its associated package note will be permanently deleted.
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
                                Deleting...
                            </span>
                        ) : (
                            "Delete Estimation"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    )
}
