import type { Transaction } from "@/lib/definitions"

export function getUniqueYears(transactions: Transaction[]): number[] {
  return Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)
}

export function getMonthsConfig(t: (key: string) => string) {
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
