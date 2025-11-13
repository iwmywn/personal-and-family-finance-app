"use client"

import { type Dispatch, type SetStateAction } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useLocale, useTranslations } from "next-intl"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { env } from "@/env/client"

interface ReCaptchaPopupProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  setRecaptchaToken: (token: string | null) => void
}

export function ReCaptchaDialog({
  open,
  setOpen,
  setRecaptchaToken,
}: ReCaptchaPopupProps) {
  const locale = useLocale()
  const t = useTranslations()

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token) {
      toast.error(t("auth.fe.recaptchaVerificationFailed"))
      return
    }

    setRecaptchaToken(token)
    setOpen(false)
  }

  const handleDialogClose = () => {
    toast.error(t("auth.fe.completeRecaptchaVerification"))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="w-fit">
        <VisuallyHidden>
          <DialogTitle>{t("auth.fe.recaptchaVerification")}</DialogTitle>
        </VisuallyHidden>
        <ReCAPTCHA
          sitekey={env.NEXT_PUBLIC_RECAPTCHA}
          onChange={handleRecaptchaChange}
          hl={locale}
          className="m-3"
        />
      </DialogContent>
    </Dialog>
  )
}
