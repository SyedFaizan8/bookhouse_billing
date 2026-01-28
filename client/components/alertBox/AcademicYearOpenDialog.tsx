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

export function AcademicYearOpenDialog({
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
                    <AlertDialogTitle className="text-orange-600  underline underline-offset-2">
                        Open Academic Year?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        You are about to open the academic year{" "}
                        <strong>{year.name}</strong>.
                        <br /><br />

                        Period:{" "}
                        {new Date(year.startDate).toLocaleDateString()} →{" "}
                        {new Date(year.endDate).toLocaleDateString()}
                        <br />
                        Current Status: {year.status}
                        <br /><br />

                        <span className="text-orange-700 font-medium">
                            • This year will become the active academic year<br />
                            • The currently open academic year will be closed
                        </span>
                        <br /><br />

                        <span className="text-slate-500">
                            This action should be used only for audit or correction purposes.
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
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {loading ? "Opening..." : "Open Academic Year"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
