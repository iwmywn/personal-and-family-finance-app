"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSignInSchema, type SignInFormValues } from "@/schemas"
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
import { Input } from "@/components/ui/input"
import { ReCaptchaDialog } from "@/components/auth/recaptcha-dialog"
import { FormButton } from "@/components/custom/form-button"
import { PasswordInput } from "@/components/custom/password-input"
import { client } from "@/lib/auth-client"

export function SignInForm() {
  const [isReCaptchaOpen, setIsReCaptchaOpen] = useState<boolean>(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const t = useTranslations()
  const schema = createSignInSchema(t)
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const router = useRouter()

  const processSignIn = useCallback(
    async (values: SignInFormValues, token: string) => {
      if (isLoading) return

      setIsLoading(true)
      try {
        await client.signIn.username({
          username: values.username,
          password: values.password,
          fetchOptions: {
            headers: {
              "x-captcha-response": token,
            },
            onError: (ctx) => {
              if (ctx.error.status === 401)
                toast.error(t("auth.be.signInError"))
              else toast.error(t("auth.be.signInFailed"))
            },
            onSuccess: () => {
              const searchParams = new URLSearchParams(window.location.search)
              let callbackUrl = searchParams.get("next")

              if (window.location.hash) {
                callbackUrl = callbackUrl + window.location.hash
              }

              form.reset()
              router.push(callbackUrl || "/home")
            },
          },
        })
      } finally {
        setIsLoading(false)
        setRecaptchaToken(null)
      }
    },
    [isLoading, form, router]
  )

  function onSubmit(values: SignInFormValues) {
    if (isLoading) return

    if (!recaptchaToken) {
      setIsReCaptchaOpen(true)
      return
    }

    void processSignIn(values, recaptchaToken)
  }

  useEffect(() => {
    if (recaptchaToken && !isLoading) {
      void processSignIn(form.getValues(), recaptchaToken)
    }
  }, [recaptchaToken, isLoading, form, processSignIn])

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="username">
                  {t("auth.fe.username")}
                </FormLabel>
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
                <FormLabel htmlFor="password">
                  {t("auth.fe.password")}
                </FormLabel>
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
            isSubmitting={isLoading || form.formState.isSubmitting}
            text={t("auth.fe.signIn")}
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
