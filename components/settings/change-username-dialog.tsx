"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { FormButton } from "@/components/custom/form-button"
import { useAppData } from "@/context/app-data-context"
import { useSchemas } from "@/hooks/use-schemas"
import { client } from "@/lib/auth-client"
import { type UsernameFormValues } from "@/schemas/types"

export function ChangeUsernameDialog() {
  const t = useExtracted()
  const { createUsernameSchema } = useSchemas()

  const router = useRouter()
  const { user } = useAppData()
  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(createUsernameSchema()),
    defaultValues: {
      username: user.username || "",
    },
  })
  const [open, setOpen] = useState<boolean>(false)

  async function onSubmit(values: UsernameFormValues) {
    const parsedValues = createUsernameSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    const { data: response, error } = await client.isUsernameAvailable({
      username: values.username,
    })

    if (error || !response) {
      toast.error(
        t("Failed to check username availability! Please try again later.")
      )
    } else if (!response.available && user.username !== values.username) {
      toast.error(t("This username is already taken."))
    } else {
      await client.updateUser({
        username: values.username,
        fetchOptions: {
          onError: () => {
            toast.error(t("Failed to update username! Please try again later."))
          },
          onSuccess: () => {
            router.refresh()
            toast.success(t("Your username has been changed."))
            form.reset({ username: values.username })
            setOpen(false)
          },
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("Change Username")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Change Username")}</DialogTitle>
          <DialogDescription>
            {t("Update your unique username.")}
          </DialogDescription>
        </DialogHeader>

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
                      placeholder={t("Enter your username...")}
                      autoComplete="username"
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
