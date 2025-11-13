"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteBudget(budgetId)

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
          <AlertDialogTitle>
            {t("budgets.fe.deleteBudgetTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {t("budgets.fe.deleteBudgetDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.fe.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} {t("common.fe.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
