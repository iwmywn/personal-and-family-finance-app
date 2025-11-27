"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNameSchema, type NameFormValues } from "@/schemas"
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

export function ChangeNameDialog() {
  const t = useTranslations()
  const router = useRouter()
  const { user } = useAppData()
  const schema = createNameSchema(t)
  const form = useForm<NameFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
    },
  })
  const [open, setOpen] = useState<boolean>(false)

  async function onSubmit(values: NameFormValues) {
    await client.updateUser({
      name: values.name,
      fetchOptions: {
        onError: () => {
          toast.error(t("settings.be.nameUpdateFailed"))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("settings.be.nameUpdated"))
          form.reset({ name: values.name })
          setOpen(false)
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("settings.fe.changeName")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.fe.changeName")}</DialogTitle>
          <DialogDescription>
            {t("settings.fe.changeNameDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">{t("settings.fe.name")}</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder={t("settings.fe.namePlaceholder")}
                      autoComplete="name"
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
