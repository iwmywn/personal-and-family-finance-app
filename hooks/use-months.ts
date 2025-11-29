"use client"

import { useExtracted } from "next-intl"

export function useMonths() {
  const t = useExtracted()

  return [
    { value: "1", label: t("January") },
    { value: "2", label: t("February") },
    { value: "3", label: t("March") },
    { value: "4", label: t("April") },
    { value: "5", label: t("May") },
    { value: "6", label: t("June") },
    { value: "7", label: t("July") },
    { value: "8", label: t("August") },
    { value: "9", label: t("September") },
    { value: "10", label: t("October") },
    { value: "11", label: t("November") },
    { value: "12", label: t("December") },
  ]
}
