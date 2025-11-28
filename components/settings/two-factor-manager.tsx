"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createTwoFactorCodeSchema,
  createTwoFactorPasswordSchema,
  type TwoFactorCodeFormValues,
  type TwoFactorPasswordFormValues,
} from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label"
import { FormButton } from "@/components/custom/form-button"
import { PasswordInput } from "@/components/custom/password-input"
import { useAppData } from "@/context/app-data-context"
import { client } from "@/lib/auth-client"

export function TwoFactorManager() {
  const t = useTranslations()
  const { user } = useAppData()
  const [open, setOpen] = useState<boolean>(false)
  const [totpURI, setTotpURI] = useState<string | null>(null)

  const secret = totpURI?.match(/secret=([^&]+)/)?.[1]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {user.twoFactorEnabled
            ? t("settings.fe.twoFactorDisable")
            : t("settings.fe.twoFactorEnable")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {!user.twoFactorEnabled ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("settings.fe.twoFactorEnableDialogTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("settings.fe.twoFactorEnableDialogDescription")}
              </DialogDescription>
            </DialogHeader>
            {!totpURI ? (
              <EnableTwoFactorForm setTotpURI={setTotpURI} />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCode value={totpURI} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("settings.fe.twoFactorSecretLabel")}</Label>
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-xs"
                    onFocus={(event) => event.target.select()}
                  />
                </div>

                <VerifyTwoFactorForm
                  setTotpURI={setTotpURI}
                  setOpen={setOpen}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("settings.fe.twoFactorDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("settings.fe.twoFactorDialogDescriptionEnabled")}
              </DialogDescription>
            </DialogHeader>
            <DisableTwoFactorForm setOpen={setOpen} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface EnableTwoFactorFormProps {
  setTotpURI: (uri: string | null) => void
}

function EnableTwoFactorForm({ setTotpURI }: EnableTwoFactorFormProps) {
  const t = useTranslations()
  const form = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(createTwoFactorPasswordSchema(t)),
    defaultValues: { password: "" },
  })

  async function onSubmit(values: TwoFactorPasswordFormValues) {
    await client.twoFactor.enable({
      password: values.password,
      fetchOptions: {
        onError: (ctx) => {
          if (ctx.error.code === "INVALID_PASSWORD") {
            toast.error(t("settings.be.invalidPassword"))
          } else {
            toast.error(t("settings.be.twoFactorEnableFailed"))
          }
        },
        onSuccess: (ctx) => {
          form.reset()
          setTotpURI(ctx.data.totpURI)
        },
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.fe.twoFactorPasswordLabel")}</FormLabel>
              <FormControl>
                <PasswordInput
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
          text={t("settings.fe.twoFactorEnable")}
          isSubmitting={form.formState.isSubmitting}
          className="w-full"
        />
      </form>
    </Form>
  )
}

interface VerifyTwoFactorFormProps {
  setTotpURI: (uri: string | null) => void
  setOpen: (open: boolean) => void
}

function VerifyTwoFactorForm({
  setTotpURI,
  setOpen,
}: VerifyTwoFactorFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm<TwoFactorCodeFormValues>({
    resolver: zodResolver(createTwoFactorCodeSchema(t)),
    defaultValues: { code: "" },
  })

  async function onSubmit(values: TwoFactorCodeFormValues) {
    await client.twoFactor.verifyTotp({
      code: values.code,
      fetchOptions: {
        onError: () => {
          toast.error(t("settings.be.twoFactorVerifyFailed"))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("settings.be.twoFactorEnabled"))
          form.reset()
          setTotpURI(null)
          setOpen(false)
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
              <FormLabel>{t("settings.fe.twoFactorCodeLabel")}</FormLabel>
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

        <FormButton
          text={t("settings.fe.twoFactorVerify")}
          isSubmitting={form.formState.isSubmitting}
          className="w-full"
        />
      </form>
    </Form>
  )
}

interface DisableTwoFactorFormProps {
  setOpen: (open: boolean) => void
}

function DisableTwoFactorForm({ setOpen }: DisableTwoFactorFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(createTwoFactorPasswordSchema(t)),
    defaultValues: { password: "" },
  })

  async function onSubmit(values: TwoFactorPasswordFormValues) {
    await client.twoFactor.disable({
      password: values.password,
      fetchOptions: {
        onError: () => {
          toast.error(t("settings.be.twoFactorDisableFailed"))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("settings.be.twoFactorDisabled"))
          form.reset()
          setOpen(false)
        },
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.fe.twoFactorPasswordLabel")}</FormLabel>
              <FormControl>
                <PasswordInput
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
          text={t("settings.fe.twoFactorDisable")}
          isSubmitting={form.formState.isSubmitting}
          className="w-full"
        />
      </form>
    </Form>
  )
}
