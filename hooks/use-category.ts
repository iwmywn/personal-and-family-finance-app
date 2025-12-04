"use client"

import { useCategoryConfig } from "@/hooks/use-category-config"
import type { CategoryKeyType, CategoryType } from "@/lib/categories"

export function useCategory() {
  const categories = useCategoryConfig()

  const getCategoryLabel = (key: CategoryKeyType): string => {
    return categories.find((c) => c.key === key)?.label ?? ""
  }

  const getCategoryDescription = (key: CategoryKeyType): string => {
    return categories.find((c) => c.key === key)?.description ?? ""
  }

  const getCategoriesByType = (type: CategoryType) => {
    return categories.filter((c) => c.type === type)
  }

  return {
    getCategoryLabel,
    getCategoryDescription,
    getCategoriesByType,
  }
}
