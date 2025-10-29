"use client"

import { type AppLocale } from "@/i18n/config"
import { useLocale } from "next-intl"

import { formatDate } from "@/lib/utils"

export function useFormatDate() {
  const locale = useLocale() as AppLocale

  return (date: Date) => {
    return formatDate(date, locale)
  }
}
