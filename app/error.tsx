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
  const tAppError = useTranslations("appError")
  const tCommonFE = useTranslations("common.fe")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center md:px-16">
      <h2 className="text-lg font-semibold">{tAppError("title")}</h2>
      <Button className="mt-2" asChild>
        <Link href="/home">{tCommonFE("backToHome")}</Link>
      </Button>
    </div>
  )
}
