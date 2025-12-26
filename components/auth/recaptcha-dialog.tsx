"use client"

import { type Dispatch, type SetStateAction } from "react"
import { useExtracted, useLocale } from "next-intl"
import { VisuallyHidden } from "radix-ui"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { env } from "@/env/client.mjs"

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
  const t = useExtracted()

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token) {
      toast.error(t("CAPTCHA verification failed! Please try again later."))
      return
    }

    setRecaptchaToken(token)
    setOpen(false)
  }

  const handleDialogClose = () => {
    toast.error(t("Please complete CAPTCHA verification!"))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="w-fit">
        <VisuallyHidden.Root>
          <DialogTitle>{t("CAPTCHA Verification")}</DialogTitle>
        </VisuallyHidden.Root>
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
