"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
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
import { Input } from "@/components/ui/input"
import { ReCaptchaDialog } from "@/components/auth/recaptcha-dialog"
import { FormButton } from "@/components/custom/form-button"
import { PasswordInput } from "@/components/custom/password-input"
import { useSchemas } from "@/hooks/use-schemas"
import type { AppLocale } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { client } from "@/lib/auth-client"
import { type SignInFormValues } from "@/schemas/types"

export function SignInForm() {
  const [isReCaptchaOpen, setIsReCaptchaOpen] = useState<boolean>(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const t = useExtracted()
  const { createSignInSchema } = useSchemas()
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(createSignInSchema()),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  const processSignIn = useCallback(
    async (values: SignInFormValues, token: string) => {
      if (isSubmitting) return

      const parsedValues = createSignInSchema().safeParse(values)

      if (!parsedValues.success) {
        toast.error(t("Invalid data!"))
        return
      }

      setIsSubmitting(true)

      try {
        await client.signIn.username({
          username: values.username,
          password: values.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": token,
            },
            onError: (ctx) => {
              if (ctx.error.code === "INVALID_USERNAME_OR_PASSWORD")
                toast.error(t("Invalid username or password!"))
              else toast.error(t("Failed to sign in! Please try again later."))
            },
            onSuccess: async (ctx) => {
              const callbackUrl = searchParams.get("next") || "/home"

              if (ctx.data.twoFactorRedirect) {
                const target = new URL("/two-factor", window.location.origin)
                target.searchParams.set("next", callbackUrl)
                router.push(`${target.pathname}${target.search}`)
                form.reset()
                return
              }

              router.push(callbackUrl)
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
      } finally {
        setIsSubmitting(false)
        setRecaptchaToken(null)
      }
    },
    [isSubmitting, t, searchParams, form, router]
  )

  function onSubmit(values: SignInFormValues) {
    if (isSubmitting) return

    if (!recaptchaToken) {
      setIsReCaptchaOpen(true)
      return
    }

    void processSignIn(values, recaptchaToken)
  }

  useEffect(() => {
    if (recaptchaToken && !isSubmitting) {
      void processSignIn(form.getValues(), recaptchaToken)
    }
  }, [recaptchaToken, isSubmitting, form, processSignIn])

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="username">{t("Username")}</FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    placeholder="admin"
                    type="text"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">{t("Password")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="********"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormButton
            isSubmitting={isSubmitting}
            text={t("Sign In")}
            className="w-full"
          />
        </form>
      </Form>

      <ReCaptchaDialog
        open={isReCaptchaOpen}
        setOpen={setIsReCaptchaOpen}
        setRecaptchaToken={setRecaptchaToken}
      />
    </>
  )
}
