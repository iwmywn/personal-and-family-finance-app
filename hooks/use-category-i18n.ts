"use client"

import { useTranslations } from "next-intl"

import { useAppData } from "@/context/app-data-context"
import {
  createCategoryConfig,
  getDescription,
  getDetails,
  getLabel,
  type CategoryKeyType,
  type TransactionType,
} from "@/lib/categories"

export function useCategoryI18n() {
  const t = useTranslations()
  const CATEGORY_CONFIG = createCategoryConfig(t)
  const { customCategories } = useAppData()

  const getCategoryLabel = (categoryKey: CategoryKeyType): string => {
    return getLabel(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoryDescription = (categoryKey: CategoryKeyType): string => {
    return getDescription(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoriesWithDetails = (type: TransactionType) => {
    return getDetails(type, CATEGORY_CONFIG)
  }

  return { getCategoryLabel, getCategoryDescription, getCategoriesWithDetails }
}
