"use client"

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

import { clientEnv } from "@/env/client"

export function ReCaptchaProvider({
  children,
  language,
}: Readonly<{
  children: React.ReactNode
  language: string
}>) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={clientEnv.NEXT_PUBLIC_RECAPTCHA}
      language={language}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
