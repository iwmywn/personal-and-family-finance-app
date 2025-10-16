import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd MMM yyyy", { locale: vi })
}

export function isCurrentMonth(inputDate: Date) {
  const date = new Date(inputDate)
  const now = new Date()
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

export const normalizeToUTCDate = (date: Date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}
