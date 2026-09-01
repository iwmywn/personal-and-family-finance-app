"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormButton,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/password-input"
import { useSchemas } from "@/hooks/use-schemas"
import { authClient } from "@/lib/auth-client"
import type { User } from "@/lib/definitions"
import type { AdminPasswordFormValues } from "@/schemas/types"

interface SetPasswordDialogProps {
  user: User
  open: boolean
  setOpen: (open: boolean) => void
}

export function SetPasswordDialog({
  user,
  open,
  setOpen,
}: SetPasswordDialogProps) {
  const t = useExtracted()
  const router = useRouter()
  const { createAdminPasswordSchema } = useSchemas()
  const form = useForm<AdminPasswordFormValues>({
    resolver: zodResolver(createAdminPasswordSchema()),
    defaultValues: {
      password: "",
    },
  })

  async function onSubmit(values: AdminPasswordFormValues) {
    await authClient.admin.setUserPassword({
      userId: user.id,
      newPassword: values.password,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to set user password! Please try again later."))
        },
        onSuccess: () => {
          setOpen(false)
          toast.success(t("Password has been updated."))
          router.refresh()
          form.reset()
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Reset User Password")}</DialogTitle>
          <DialogDescription>
            {t("Set a new password for")} <strong>{user.name}</strong> (
            {user.email}).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form-password">
                    {t("New Password")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="form-password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("Cancel")}</Button>
              </DialogClose>
              <FormButton isSubmitting={form.formState.isSubmitting}>
                {t("Update Password")}
              </FormButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
