"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormButton } from "@/components/form-button"
import { PasswordInput } from "@/components/password-input"
import { useSchemas } from "@/hooks/use-schemas"
import { client } from "@/lib/auth-client"
import { type PasswordFormValues } from "@/schemas/types"

export function ChangePasswordDialog() {
  const t = useExtracted()
  const { createPasswordSchema } = useSchemas()
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(createPasswordSchema()),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: false,
    },
  })
  const [open, setOpen] = useState<boolean>(false)

  async function onSubmit(values: PasswordFormValues) {
    const parsedValues = createPasswordSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    await client.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: values.revokeOtherSessions,
      fetchOptions: {
        onError: (ctx) => {
          if (ctx.error.code === "INVALID_PASSWORD")
            toast.error(t("Current password is incorrect!"))
          else
            toast.error(t("Failed to update password! Please try again later."))
        },
        onSuccess: () => {
          toast.success(t("Your password has been changed."))
          form.reset()
          setOpen(false)
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("Change Password")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Change Password")}</DialogTitle>
          <DialogDescription>{t("Update your password.")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form-current-password">
                    {t("Current Password")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="form-current-password"
                      placeholder="********"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form-new-password">
                    {t("New Password")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="form-new-password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form-confirm-password">
                    {t("Confirm Password")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="form-confirm-password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <Checkbox
                      id="form-sign-out-all"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel id="form-sign-out-all">
                    {t("Sign out from all other devices.")}
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("Cancel")}</Button>
              </DialogClose>
              <FormButton
                isSubmitting={form.formState.isSubmitting}
                text={t("Save")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
