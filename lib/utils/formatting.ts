import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "EEEEE, dd/MM/yyyy", { locale: vi })
}
