"use client"

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
import { PasswordInput } from "@/components/ui/password-input"
import { FormButton } from "@/components/form-button"
import { FormLink } from "@/components/form-link"

export type SignInFormValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const router = useRouter()

  async function onSubmit(values: SignInFormValues) {
    const { error } = await signIn(values)

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
  }

  return (
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
            isSubmitting={form.formState.isSubmitting}
            text="Sign in"
          />
        </div>
      </form>
    </Form>
  )
}
