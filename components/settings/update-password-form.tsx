"use client"

import { passwordSchema, type PasswordFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { updatePassword } from "@/actions/account"
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

export function UpdatePasswordForm() {
  const tSettingsFE = useTranslations("settings.fe")
  const tCommonFE = useTranslations("common.fe")
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: PasswordFormValues) {
    const { success, error } = await updatePassword(values)

    if (error || !success) {
      toast.error(error)
    } else {
      toast.success(success)
      form.setValue("currentPassword", "")
      form.setValue("newPassword", "")
      form.setValue("confirmPassword", "")
    }
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
                {tSettingsFE("currentPassword")}
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
                    {tSettingsFE("newPassword")}
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
                    {tSettingsFE("confirmPassword")}
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
            text={tCommonFE("save")}
          />
        </div>
      </form>
    </Form>
  )
}
