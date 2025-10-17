"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useTransactions } from "@/lib/swr"

interface DeleteTransactionDialogProps {
  transactionId: string
  transactionDescription: string
}

export function DeleteTransactionDialog({
  transactionId,
  transactionDescription,
}: DeleteTransactionDialogProps) {
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="h-full w-full px-2 py-1.5">Xóa</div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa giao dịch</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa giao dịch &quot;{transactionDescription}
            &quot;? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
