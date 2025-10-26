"use client"

import { useState } from "react"
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
import { useTransactions } from "@/lib/swr"

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
  const t = useTranslations()
  const { transactions, mutate } = useTransactions()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteTransaction(transactionId)

    if (error || !success) {
      toast.error(error)
    } else {
      mutate({
        transactions: transactions!.filter((t) => t._id !== transactionId),
      })
      toast.success(success)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("transactions.deleteTransactionTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {t("transactions.deleteTransactionDescription", {
              description: transactionDescription,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
