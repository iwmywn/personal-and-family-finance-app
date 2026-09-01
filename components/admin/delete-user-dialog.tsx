"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

import { deleteUser } from "@/actions/admin.actions"
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
import type { User } from "@/lib/definitions"

export function DeleteUserDialog({
  user,
  open,
  setOpen,
}: {
  user: User
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const t = useExtracted()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)

    const { success, error } = await deleteUser(user.id)

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
          <AlertDialogTitle>{t("Delete User Account")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "Are you sure you want to permanently delete this user account?"
            )}{" "}
            <strong>
              {user.name} ({user.email})
            </strong>
            .{" "}
            {t(
              "All associated data including transactions, budgets, and goals will be permanently deleted. This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Spinner className="size-4" />}
            {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
