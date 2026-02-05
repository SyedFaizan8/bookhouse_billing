"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import Spinner from "../Spinner";
import { InvoiceRow } from "@/lib/types/customer";

interface Props {
    open: boolean;
    pkg: InvoiceRow | null;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function PackageDeleteDialog({
    open,
    pkg,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!pkg) return null;

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent className="max-w-md">

                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 font-bold underline underline-offset-2">
                        Delete Package Note?
                    </AlertDialogTitle>

                    {/* ✅ TEXT ONLY (no divs here) */}
                    <AlertDialogDescription>
                        You are about to permanently delete this package note.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* ✅ BLOCK CONTENT MOVED OUTSIDE DESCRIPTION */}
                <div className="bg-slate-50 border rounded-md p-3 space-y-2 text-sm">

                    <Row label="Package No" value={pkg.documentNo} />
                    <Row
                        label="Date"
                        value={new Date(pkg.date).toLocaleDateString("en-IN")}
                    />
                    <Row label="Total Quantity" value={pkg.totalQty} />
                    <Row
                        label="Pending Books"
                        value={pkg.pending ?? 0}
                        danger
                    />
                    <Row label="Amount" value={`₹${pkg.amount}`} />

                </div>

                <p className="text-red-700 font-medium text-sm mt-3">
                    ⚠ This action is permanent and cannot be undone.
                </p>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Spinner size={16} />
                                Deleting...
                            </span>
                        ) : (
                            "Delete Package Note"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}

/* small helper */
function Row({
    label,
    value,
    danger,
}: {
    label: string;
    value: any;
    danger?: boolean;
}) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <strong className={danger ? "text-red-600" : ""}>{value}</strong>
        </div>
    );
}
