"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteRecurringTransaction } from "@/actions/recurring.actions"
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

interface DeleteRecurringDialogProps {
  recurringId: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteRecurringTransactionDialog({
  recurringId,
  open,
  setOpen,
}: DeleteRecurringDialogProps) {
  const t = useExtracted()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteRecurringTransaction(recurringId)

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
          <AlertDialogTitle>
            {t("Delete Recurring Transaction")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to delete this recurring transaction? This action cannot be undone."
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
