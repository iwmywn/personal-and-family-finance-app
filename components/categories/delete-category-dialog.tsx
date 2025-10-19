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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useCustomCategories } from "@/lib/swr"

interface DeleteCategoryDialogProps {
  categoryId: string
  categoryLabel: string
}

export function DeleteCategoryDialog({
  categoryId,
  categoryLabel,
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="h-full w-full px-2 py-1.5">Xóa</div>
      </AlertDialogTrigger>
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
