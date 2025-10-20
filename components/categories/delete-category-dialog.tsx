"use client"

import { useState } from "react"
import { toast } from "sonner"

import { deleteCustomCategory } from "@/actions/categories"
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
import { useCustomCategories } from "@/lib/swr"

interface DeleteCategoryDialogProps {
  categoryId: string
  categoryLabel: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteCategoryDialog({
  categoryId,
  categoryLabel,
  open,
  setOpen,
}: DeleteCategoryDialogProps) {
  const { categories: customCategories, mutate } = useCustomCategories()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteCustomCategory(categoryId)

    if (error || !success) {
      toast.error(error)
    } else {
      mutate({
        categories: customCategories!.filter((c) => c._id !== categoryId),
      })
      toast.success(success)
    }
    setIsLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
          <AlertDialogDescription className="wrap-anywhere">
            Bạn có chắc chắn muốn xóa danh mục &quot;{categoryLabel}
            &quot;? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Spinner />} Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
