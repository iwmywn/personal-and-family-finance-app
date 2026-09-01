"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteBudget } from "@/actions/budget.actions"
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

interface DeleteBudgetDialogProps {
  budgetId: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteBudgetDialog({
  budgetId,
  open,
  setOpen,
}: DeleteBudgetDialogProps) {
  const t = useExtracted()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteBudget(budgetId)

    if (error || !success) {
      toast.error(error)
    } else {
      setOpen(false)
      toast.success(success)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Budget")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to delete this budget? This action cannot be undone."
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
