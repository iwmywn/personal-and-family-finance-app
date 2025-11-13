"use client"

import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { nunito } from "@/app/fonts"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const locale = useLocale()
  const t = useTranslations()

  return (
    <html lang={locale}>
      <body className={`${nunito.className}`}>
        <main className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center md:px-16">
          <h2 className="text-lg font-semibold">{t("appError.title")}</h2>
          <p>{error.message}</p>
          <Button onClick={() => reset()}>{t("appError.tryAgain")}</Button>
        </main>
      </body>
    </html>
  )
}
