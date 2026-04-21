"use client"

import type { Dispatch, SetStateAction } from "react"
import { useExtracted, useLocale } from "next-intl"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { clientEnv } from "@/env/client"

interface ReCaptchaPopupProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onVerify: (token: string) => void
}

export function ReCaptchaDialog({
  open,
  setOpen,
  onVerify,
}: ReCaptchaPopupProps) {
  const locale = useLocale()
  const t = useExtracted()

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token) {
      toast.error(t("CAPTCHA verification failed! Please try again later."))
      return
    }

    onVerify(token)
    setOpen(false)
  }

  const handleDialogClose = () => {
    toast.error(t("Please complete CAPTCHA verification!"))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="w-fit">
        <DialogTitle className="sr-only">
          {t("CAPTCHA Verification")}
        </DialogTitle>
        <ReCAPTCHA
          sitekey={clientEnv.NEXT_PUBLIC_RECAPTCHA}
          onChange={handleRecaptchaChange}
          hl={locale}
          className="m-3"
        />
      </DialogContent>
    </Dialog>
  )
}
