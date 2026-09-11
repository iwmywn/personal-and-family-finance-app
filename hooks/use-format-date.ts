"use client"

import { useLocale } from "next-intl"

import { formatDate } from "@/lib/date"

export function useFormatDate() {
  const locale = useLocale()

  return (date: Date) => formatDate(date, locale)
}
