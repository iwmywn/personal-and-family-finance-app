"use client"

import { useOptimistic, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { deleteBudget } from "@/actions/budgets"
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
import { useAppData } from "@/lib/app-data-context"

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
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const { budgets } = useAppData()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [_, setOptimisticBudgets] = useOptimistic(
    budgets,
    (state, budgetIdToDelete: string) => {
      return state.filter((b) => b._id !== budgetIdToDelete)
    }
  )

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteBudget(budgetId)

    if (error || !success) {
      toast.error(error)
    } else {
      setOptimisticBudgets(budgetId)
      toast.success(success)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tBudgetsFE("deleteBudgetTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {tBudgetsFE("deleteBudgetDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommonFE("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} {tCommonFE("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
