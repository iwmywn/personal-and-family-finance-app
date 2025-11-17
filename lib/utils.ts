import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

import { LOCALE_CONFIG, type AppLocale } from "@/i18n/config"
import type { Transaction } from "@/lib/definitions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function formatDate(date: Date, locale: AppLocale) {
  return format(date, LOCALE_CONFIG[locale].formatStr, {
    locale: LOCALE_CONFIG[locale].dateFnsLocale,
  })
}

export function normalizeToUTCDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function getUniqueYears(transactions: Transaction[]): number[] {
  return Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)
}
export const progressColorClass = {
  gray: "[&>[data-slot=progress-indicator]]:bg-gray-600",
  green: "[&>[data-slot=progress-indicator]]:bg-green-600",
  yellow: "[&>[data-slot=progress-indicator]]:bg-yellow-600",
  red: "[&>[data-slot=progress-indicator]]:bg-red-600",
} as const
