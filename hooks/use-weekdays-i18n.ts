"use client"

import { useTranslations } from "next-intl"

export function useWeekdaysI18n() {
  const t = useTranslations()

  return [
    { value: "1", label: t("days.monday") },
    { value: "2", label: t("days.tuesday") },
    { value: "3", label: t("days.wednesday") },
    { value: "4", label: t("days.thursday") },
    { value: "5", label: t("days.friday") },
    { value: "6", label: t("days.saturday") },
    { value: "0", label: t("days.sunday") },
  ]
}
