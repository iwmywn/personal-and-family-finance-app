"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    startTransition(async () => {
      try {
        const { success, error } = await deleteGoal(goalId)

        if (error || !success) {
          toast.error(error)
        } else {
          setOpen(false)
          toast.success(success)
          router.refresh()
        }
      } catch {
        toast.error(t("Failed to delete goal! Please try again later."))
      }
    })
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
          <AlertDialogCancel disabled={isPending}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending}>
            {isPending && <Spinner />} {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
