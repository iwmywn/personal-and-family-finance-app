"use client"

import { useOptimistic, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { deleteTransaction } from "@/actions/transactions"
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

interface DeleteTransactionDialogProps {
  transactionId: string
  transactionDescription: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteTransactionDialog({
  transactionId,
  transactionDescription,
  open,
  setOpen,
}: DeleteTransactionDialogProps) {
  const tTransactionsFE = useTranslations("transactions.fe")
  const tCommonFE = useTranslations("common.fe")
  const { transactions } = useAppData()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [_, setOptimisticTransactions] = useOptimistic(
    transactions,
    (state, transactionIdToDelete: string) => {
      return state.filter((t) => t._id !== transactionIdToDelete)
    }
  )

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteTransaction(transactionId)

    if (error || !success) {
      toast.error(error)
    } else {
      setOptimisticTransactions(transactionId)
      toast.success(success)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {tTransactionsFE("deleteTransactionTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {tTransactionsFE("deleteTransactionDescription", {
              description: transactionDescription,
            })}
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
