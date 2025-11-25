"use client"

import { createPasswordSchema, type PasswordFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormButton } from "@/components/custom/form-button"
import { PasswordInput } from "@/components/custom/password-input"
import { client } from "@/lib/auth-client"

export function UpdatePasswordForm() {
  const t = useTranslations()
  const schema = createPasswordSchema(t)
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: PasswordFormValues) {
    await client.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true,
      fetchOptions: {
        onError: (ctx) => {
          if (ctx.error.status === 400)
            toast.error(t("settings.be.passwordIncorrect"))
          else toast.error(t("settings.be.passwordUpdateFailed"))
        },
        onSuccess: () => {
          toast.success(t("settings.be.passwordUpdated"))
          form.setValue("currentPassword", "")
          form.setValue("newPassword", "")
          form.setValue("confirmPassword", "")
        },
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="currentPassword">
                {t("settings.fe.currentPassword")}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  id="currentPassword"
                  placeholder="********"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="newPassword">
                    {t("settings.fe.newPassword")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="newPassword"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">
                    {t("settings.fe.confirmPassword")}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-row-reverse">
          <FormButton
            isSubmitting={form.formState.isSubmitting}
            text={t("common.fe.save")}
          />
        </div>
      </form>
    </Form>
  )
}
