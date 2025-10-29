"use client"

import { useTranslations } from "next-intl"

export function useMonthsConfig() {
  const tMonths = useTranslations("months")

  return [
    { value: "1", label: tMonths("january") },
    { value: "2", label: tMonths("february") },
    { value: "3", label: tMonths("march") },
    { value: "4", label: tMonths("april") },
    { value: "5", label: tMonths("may") },
    { value: "6", label: tMonths("june") },
    { value: "7", label: tMonths("july") },
    { value: "8", label: tMonths("august") },
    { value: "9", label: tMonths("september") },
    { value: "10", label: tMonths("october") },
    { value: "11", label: tMonths("november") },
    { value: "12", label: tMonths("december") },
  ]
}
