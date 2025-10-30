"use client"

import { useTranslations } from "next-intl"

import {
  categoryConfig,
  getDescription,
  getDetails,
  getLabel,
  type CategoryKeyType,
  type TransactionType,
} from "@/lib/categories"
import type { CustomCategory } from "@/lib/definitions"

export function useCategoryI18n() {
  const tCategoriesConfig = useTranslations("categoriesConfig")
  const CATEGORY_CONFIG = categoryConfig(tCategoriesConfig)

  const getCategoryLabel = (
    categoryKey: CategoryKeyType,
    customCategories?: CustomCategory[]
  ): string => {
    return getLabel(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoryDescription = (
    categoryKey: CategoryKeyType,
    customCategories?: CustomCategory[]
  ): string => {
    return getDescription(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoriesWithDetails = (type: TransactionType) => {
    return getDetails(type, CATEGORY_CONFIG)
  }

  return { getCategoryLabel, getCategoryDescription, getCategoriesWithDetails }
}
