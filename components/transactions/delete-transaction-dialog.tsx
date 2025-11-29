"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteTransaction } from "@/actions/transaction.actions"
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
  const t = useExtracted()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteTransaction(transactionId)

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
          <AlertDialogTitle>{t("Delete Transaction")}</AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            {t(
              'Are you sure you want to delete the transaction "{description}"? This action cannot be undone.',
              {
                description: transactionDescription,
              }
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
