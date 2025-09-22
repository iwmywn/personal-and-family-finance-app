"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { signInSchema } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

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
import { PasswordInput } from "@/components/custom-ui/password-input"
import { FormButton } from "@/components/form-button"

export type SignInFormValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const [isReCaptchaOpen, setIsReCaptchaOpen] = useState<boolean>(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isProcessingRef = useRef<boolean>(false)
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
      if (isProcessingRef.current) return

      isProcessingRef.current = true
      setIsLoading(true)

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

      setIsLoading(false)
      setRecaptchaToken(null)
      isProcessingRef.current = false
    },
    [form, router]
  )

  const onSubmit = useCallback(
    async (values: SignInFormValues) => {
      if (isProcessingRef.current) return

      if (!recaptchaToken) {
        setIsReCaptchaOpen(true)
        return
      }

      await processSignIn(values, recaptchaToken)
    },
    [recaptchaToken, processSignIn]
  )

  useEffect(() => {
    if (recaptchaToken && !isProcessingRef.current) {
      processSignIn(form.getValues(), recaptchaToken)
    }
  }, [recaptchaToken, form, processSignIn])

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
                  <FormLabel htmlFor="username">Username</FormLabel>
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
                    <FormLabel htmlFor="password">Password</FormLabel>
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
              text="Sign in"
            />
          </div>
        </form>
      </Form>
      <ReCaptchaDialog
        open={isReCaptchaOpen}
        setOpen={setIsReCaptchaOpen}
        setRecaptchaToken={(token) => setRecaptchaToken(token)}
      />
    </>
  )
}
