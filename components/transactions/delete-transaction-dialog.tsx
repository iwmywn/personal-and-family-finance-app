"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteTransactionDialog({
  transactionId,
  open,
  setOpen,
}: DeleteTransactionDialogProps) {
  const t = useExtracted()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    startTransition(async () => {
      try {
        const { success, error } = await deleteTransaction(transactionId)

        if (error || !success) {
          toast.error(error)
        } else {
          setOpen(false)
          toast.success(success)
          router.refresh()
        }
      } catch {
        toast.error(t("Failed to delete transaction! Please try again later."))
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Transaction")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to delete this transaction? This action cannot be undone."
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
