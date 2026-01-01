import { clsx, type ClassValue } from "clsx"
import Decimal from "decimal.js"
import { twMerge } from "tailwind-merge"

import { type AppLocale } from "@/i18n/config"
import { ZERO_DECIMAL_CURRENCIES, type AppCurrency } from "@/lib/currency"
import type { Transaction } from "@/lib/definitions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: string,
  locale: AppLocale,
  currency: AppCurrency
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(parseFloat(amount))
}

export function formatDate(date: Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function localDateToUTCMidnight(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function normalizeToUTCMidnight(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
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

export function toDecimal(value: string): Decimal {
  return new Decimal(value.toString())
}

export function isZeroDecimalCurrency(currency: AppCurrency): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency)
}
