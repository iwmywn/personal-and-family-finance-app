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
import { type NameFormValues } from "@/schemas/types"

export function ChangeNameDialog() {
  const t = useExtracted()
  const { createNameSchema } = useSchemas()

  const router = useRouter()
  const { user } = useAppData()
  const form = useForm<NameFormValues>({
    resolver: zodResolver(createNameSchema()),
    defaultValues: {
      name: user.name,
    },
  })
  const [open, setOpen] = useState<boolean>(false)

  async function onSubmit(values: NameFormValues) {
    const parsedValues = createNameSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    await client.updateUser({
      name: values.name,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to update name! Please try again later."))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("Your name has been updated."))
          form.reset({ name: values.name })
          setOpen(false)
        },
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("Change Name")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Change Name")}</DialogTitle>
          <DialogDescription>
            {t("Update your display name.")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">{t("Name")}</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder={t("Enter your name...")}
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
