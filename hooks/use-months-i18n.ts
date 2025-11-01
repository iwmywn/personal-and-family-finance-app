"use client"

import { useTranslations } from "next-intl"

export function useMonthsI18n() {
  const t = useTranslations("months")

  return [
    { value: "1", label: t("january") },
    { value: "2", label: t("february") },
    { value: "3", label: t("march") },
    { value: "4", label: t("april") },
    { value: "5", label: t("may") },
    { value: "6", label: t("june") },
    { value: "7", label: t("july") },
    { value: "8", label: t("august") },
    { value: "9", label: t("september") },
    { value: "10", label: t("october") },
    { value: "11", label: t("november") },
    { value: "12", label: t("december") },
  ]
}
