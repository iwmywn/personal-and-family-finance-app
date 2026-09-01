import type { Route } from "next"
import { DEFAULT_SIGNIN_REDIRECT } from "@/routes"
import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import Decimal from "decimal.js"
import { twMerge } from "tailwind-merge"

import type { AppLocale } from "@/i18n/config"
import type { AppCurrency } from "@/lib/currency"
import type { Transaction } from "@/lib/definitions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: string,
  locale: AppLocale,
  currency: AppCurrency
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(parseFloat(amount))
}

export function formatDate(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function localDateToUTCMidnight(date: Date): Date {
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

export function toDecimal(value: string): Decimal {
  return new Decimal(value.toString())
}

export function convertAmountWithRates(
  amount: Decimal | string | number,
  from: AppCurrency,
  to: AppCurrency,
  rates?: Record<AppCurrency, Decimal | string | number>
): Decimal {
  const decAmount = new Decimal(amount)
  if (from === to || !rates) return decAmount

  const rateFrom = new Decimal(rates[from])
  const rateTo = new Decimal(rates[to])

  const amountInUSD = from === "USD" ? decAmount : decAmount.dividedBy(rateFrom)
  const result = to === "USD" ? amountInUSD : amountInUSD.mul(rateTo)

  return result
}

export function getSafeCallbackUrl(
  url: string | null | undefined,
  fallback: Route = DEFAULT_SIGNIN_REDIRECT as Route
): Route {
  if (!url) return fallback

  if (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("\\") &&
    !url.includes(":")
  ) {
    return url as Route
  }

  return fallback
}
