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

import { AcademicYear } from "@/lib/types/academicYear"

interface Props {
    open: boolean
    year: AcademicYear | null
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export function AcademicYearCloseDialog({
    open,
    year,
    loading,
    onCancel,
    onConfirm,
}: Props) {
    if (!year) return null

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 underline underline-offset-2">
                        Close Academic Year?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to close the academic year{" "}
                        <strong>{year.name}</strong>.
                        <br /><br />

                        Period:{" "}
                        {new Date(year.startDate).toLocaleDateString("en-IN")} →{" "}
                        {new Date(year.endDate).toLocaleDateString("en-IN")}
                        <br />
                        Status: {year.status}
                        <br /><br />

                        <span className="text-red-700 font-medium">
                            Billing and payments will be locked
                        </span>
                        <br /><br />

                        <span className="text-slate-500">
                            Reopening this year later requires admin permission.
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
                        {loading ? "Closing..." : "Close Academic Year"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
