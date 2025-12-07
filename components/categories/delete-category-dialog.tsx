"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteCustomCategory } from "@/actions/category.actions"
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

interface DeleteCategoryDialogProps {
  categoryId: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function DeleteCategoryDialog({
  categoryId,
  open,
  setOpen,
}: DeleteCategoryDialogProps) {
  const t = useExtracted()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete() {
    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteCustomCategory(categoryId)

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
          <AlertDialogTitle>{t("Delete Category")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to delete this category? This action cannot be undone."
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
