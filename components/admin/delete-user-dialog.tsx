"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

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
import { authClient } from "@/lib/auth-client"
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
  const [isPending, startTransition] = useTransition()

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    startTransition(async () => {
      try {
        await authClient.admin.removeUser({
          userId: user.id,
          fetchOptions: {
            onError: () => {
              toast.error(t("Failed to delete user! Please try again later."))
            },
            onSuccess: () => {
              setOpen(false)
              toast.success(t("User has been deleted."))
              router.refresh()
            },
          },
        })
      } catch {
        toast.error(t("Failed to delete user! Please try again later."))
      }
    })
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
              "All associated data will be permanently deleted. This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Spinner className="size-4" />}
            {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
