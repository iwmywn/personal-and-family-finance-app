import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

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

export function formatDate(date: Date) {
  return format(date, "EEEEE, dd/MM/yyyy", { locale: vi })
}

export function normalizeToUTCDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function getUniqueYears(transactions: Transaction[]): number[] {
  return Array.from(
    new Set(transactions.map((t) => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a)
}
