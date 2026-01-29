"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useExtracted } from "next-intl"
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
import { FormButton } from "@/components/form-button"
import { PasswordInput } from "@/components/password-input"
import { useAppData } from "@/context/app-data-context"
import { useSchemas } from "@/hooks/use-schemas"
import { client } from "@/lib/auth-client"
import {
  type TwoFactorCodeFormValues,
  type TwoFactorPasswordFormValues,
} from "@/schemas/types"

export function TwoFactorManagerDialog() {
  const t = useExtracted()
  const { user } = useAppData()
  const [open, setOpen] = useState<boolean>(false)
  const [totpURI, setTotpURI] = useState<string | null>(null)

  const secret = totpURI?.match(/secret=([^&]+)/)?.[1]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {user.twoFactorEnabled ? t("Disable 2FA") : t("Enable 2FA")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {!user.twoFactorEnabled ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("Enable Two-Factor Authentication")}</DialogTitle>
              <DialogDescription>
                {t("Scan the QR code with your authenticator app.")}
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
                  <Label>{t("Secret Key")}</Label>
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
              <DialogTitle>
                {t("Disable Two-Factor Authentication")}
              </DialogTitle>
              <DialogDescription>
                {t("Enter your password to disable 2FA.")}
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
  const t = useExtracted()
  const { createTwoFactorPasswordSchema } = useSchemas()
  const form = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(createTwoFactorPasswordSchema()),
    defaultValues: { password: "" },
  })

  async function onSubmit(values: TwoFactorPasswordFormValues) {
    const parsedValues = createTwoFactorPasswordSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    await client.twoFactor.enable({
      password: values.password,
      fetchOptions: {
        onError: (ctx) => {
          if (ctx.error.code === "INVALID_PASSWORD") {
            toast.error(t("Invalid password."))
          } else {
            toast.error(t("Failed to enable 2FA! Please try again later."))
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
              <FormLabel htmlFor="form-password">{t("Password")}</FormLabel>
              <FormControl>
                <PasswordInput
                  id="form-password"
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
          text={t("Enable 2FA")}
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
  const t = useExtracted()
  const { createTwoFactorCodeSchema } = useSchemas()

  const router = useRouter()
  const form = useForm<TwoFactorCodeFormValues>({
    resolver: zodResolver(createTwoFactorCodeSchema()),
    defaultValues: { code: "" },
  })

  async function onSubmit(values: TwoFactorCodeFormValues) {
    const parsedValues = createTwoFactorCodeSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    await client.twoFactor.verifyTotp({
      code: values.code,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to verify 2FA code! Please try again later."))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("Two-factor authentication is now enabled."))
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
              <FormLabel htmlFor="form-verification-code">
                {t("Verification Code")}
              </FormLabel>
              <FormControl>
                <Input
                  id="form-verification-code"
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
          text={t("Verify")}
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
  const t = useExtracted()
  const { createTwoFactorPasswordSchema } = useSchemas()

  const router = useRouter()
  const form = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(createTwoFactorPasswordSchema()),
    defaultValues: { password: "" },
  })

  async function onSubmit(values: TwoFactorPasswordFormValues) {
    const parsedValues = createTwoFactorPasswordSchema().safeParse(values)

    if (!parsedValues.success) {
      toast.error(t("Invalid data!"))
      return
    }

    await client.twoFactor.disable({
      password: values.password,
      fetchOptions: {
        onError: () => {
          toast.error(t("Failed to disable 2FA! Please try again later."))
        },
        onSuccess: () => {
          router.refresh()
          toast.success(t("Two-factor authentication is now disabled."))
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
              <FormLabel htmlFor="form-password">{t("Password")}</FormLabel>
              <FormControl>
                <PasswordInput
                  id="form-password"
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
          text={t("Disable 2FA")}
          isSubmitting={form.formState.isSubmitting}
          className="w-full"
        />
      </form>
    </Form>
  )
}
