"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUsernameSchema, type UsernameFormValues } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
import { client } from "@/lib/auth-client"

export function ChangeUsernameDialog() {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useAppData()
  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(createUsernameSchema(t)),
    defaultValues: {
      username: user.username || "",
    },
  })
  const [open, setOpen] = useState<boolean>(false)

  async function onSubmit(values: UsernameFormValues) {
    const { data: response, error } = await client.isUsernameAvailable({
      username: values.username,
    })

    if (error || !response) {
      toast.error(t("settings.be.usernameCheckFailed"))
    } else if (!response.available && user.username !== values.username) {
      toast.error(t("settings.be.usernameNotAvailable"))
    } else {
      await client.updateUser({
        username: values.username,
        fetchOptions: {
          onError: () => {
            toast.error(t("settings.be.usernameUpdateFailed"))
          },
          onSuccess: () => {
            router.refresh()
            toast.success(t("settings.be.usernameUpdated"))
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
        <Button variant="outline">{t("settings.fe.changeUsername")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.fe.changeUsername")}</DialogTitle>
          <DialogDescription>
            {t("settings.fe.changeUsernameDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="username">
                    {t("settings.fe.username")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="username"
                      placeholder={t("settings.fe.usernamePlaceholder")}
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
                <Button variant="outline">{t("common.fe.cancel")}</Button>
              </DialogClose>
              <FormButton
                isSubmitting={form.formState.isSubmitting}
                text={t("common.fe.save")}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
