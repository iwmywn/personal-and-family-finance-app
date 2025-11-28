"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  createTwoFactorCodeSchema,
  type TwoFactorCodeFormValues,
} from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormButton } from "@/components/custom/form-button"
import type { AppLocale } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { client } from "@/lib/auth-client"

export function TwoFactorVerificationForm() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("next") || "/home"

  const form = useForm<TwoFactorCodeFormValues>({
    resolver: zodResolver(createTwoFactorCodeSchema(t)),
    defaultValues: { code: "", trustDevice: false },
  })

  async function onSubmit(values: TwoFactorCodeFormValues) {
    await client.twoFactor.verifyTotp({
      code: values.code,
      trustDevice: values.trustDevice,
      fetchOptions: {
        onError: () => {
          toast.error(t("auth.be.twoFactorVerifyFailed"))
        },
        onSuccess: async () => {
          router.replace(callbackUrl)
          form.reset()
          await client.getSession({
            fetchOptions: {
              onSuccess: async (ctx) => {
                await setUserLocale(ctx.data.user.locale as AppLocale)
              },
            },
          })
        },
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.fe.twoFactorCodeLabel")}</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trustDevice"
          render={({ field }) => (
            <FormItem className="flex flex-row space-y-0 space-x-3 border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="">
                  {t("settings.fe.twoFactorTrustDevice")}
                </FormLabel>
                <FormDescription>
                  {t("settings.fe.twoFactorTrustDeviceDescription")}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormButton
          text={t("auth.fe.twoFactorSubmit")}
          isSubmitting={form.formState.isSubmitting}
          className="w-full"
        />
      </form>
    </Form>
  )
}
