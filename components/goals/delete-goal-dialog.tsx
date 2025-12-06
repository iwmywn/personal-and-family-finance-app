"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteGoal } from "@/actions/goal.actions"
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
import { Spinner } from "@/components/ui/spinner"

interface DeleteGoalDialogProps {
  goalId: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteGoalDialog({
  goalId,
  open,
  setOpen,
}: DeleteGoalDialogProps) {
  const t = useExtracted()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteGoal(goalId)

    if (error || !success) {
      toast.error(error)
    } else {
      toast.success(success)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Goal")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to delete this goal? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
