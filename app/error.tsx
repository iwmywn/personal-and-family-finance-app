"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const t = useTranslations()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center md:px-16">
      <h2 className="text-lg font-semibold">{t("appError.title")}</h2>
      <Button className="mt-2" asChild>
        <Link href="/home">{t("common.fe.backToHome")}</Link>
      </Button>
    </div>
  )
}
