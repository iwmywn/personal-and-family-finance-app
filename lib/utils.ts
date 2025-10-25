import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { twMerge } from "tailwind-merge"

import { CATEGORY_CONFIG } from "@/lib/categories"
import type {
  CustomCategory,
  TransactionCategoryKey,
  TransactionType,
} from "@/lib/definitions"

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
  return format(new Date(date), "EEEEE, dd/MM/yyyy", { locale: vi })
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

export function getCategoriesWithDetails(type: TransactionType) {
  return Object.entries(CATEGORY_CONFIG)
    .filter(([_, config]) => config.type === type)
    .map(([categoryKey, config]) => ({
      label: config.label,
      description: config.description,
      categoryKey: categoryKey as TransactionCategoryKey,
    }))
}

function getCategoryProperty(
  categoryKey: TransactionCategoryKey,
  property: "label" | "description",
  customCategories?: CustomCategory[]
) {
  if (categoryKey in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG][
      property
    ]
  }
  return (
    customCategories?.find((c) => c.categoryKey === categoryKey)?.[property] ||
    ""
  )
}

export function getCategoryLabel(
  categoryKey: TransactionCategoryKey,
  customCategories?: CustomCategory[]
) {
  return getCategoryProperty(categoryKey, "label", customCategories)
}

export function getCategoryDescription(
  categoryKey: TransactionCategoryKey,
  customCategories?: CustomCategory[]
) {
  return getCategoryProperty(categoryKey, "description", customCategories)
}
