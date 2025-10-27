"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signInSchema, type SignInFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { signIn } from "@/actions/auth"
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

export function SignInForm() {
  const [isReCaptchaOpen, setIsReCaptchaOpen] = useState<boolean>(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const tAuthFE = useTranslations("auth.fe")
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
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
        const { error } = await signIn(values, token)

        if (error) {
          toast.error(error)
        } else {
          const searchParams = new URLSearchParams(window.location.search)
          let callbackUrl = searchParams.get("next")

          if (window.location.hash) {
            callbackUrl = callbackUrl + window.location.hash
          }

          form.reset()
          router.push(callbackUrl || "/home")
        }
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="username">
                    {tAuthFE("username")}
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
                <FormItem className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <FormLabel htmlFor="password">
                      {tAuthFE("password")}
                    </FormLabel>
                  </div>
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
              text={tAuthFE("signIn")}
            />
          </div>
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
