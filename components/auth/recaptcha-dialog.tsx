"use client"

import { Dispatch, SetStateAction } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useLocale } from "next-intl"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

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

  const handleRecaptchaChange = async (token: string | null) => {
    if (!token) {
      toast.error("Xác thực CAPTCHA thất bại! Vui lòng thử lại.")
      return
    }

    setRecaptchaToken(token)
    setOpen(false)
  }

  const handleDialogClose = () => {
    toast.error("Vui lòng hoàn thành xác thực CAPTCHA!")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="w-fit">
        <VisuallyHidden>
          <DialogTitle>Xác thực CAPTCHA</DialogTitle>
        </VisuallyHidden>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA!}
          onChange={handleRecaptchaChange}
          hl={locale}
          className="m-3"
        />
      </DialogContent>
    </Dialog>
  )
}
