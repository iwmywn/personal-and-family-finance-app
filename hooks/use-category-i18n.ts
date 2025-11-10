"use client"

import { useTranslations } from "next-intl"

import {
  createCategoryConfig,
  getDescription,
  getDetails,
  getLabel,
  type CategoryKeyType,
  type TransactionType,
} from "@/lib/categories"
import type { Category } from "@/lib/definitions"

export function useCategoryI18n() {
  const tCategoriesConfig = useTranslations("categoriesConfig")
  const CATEGORY_CONFIG = createCategoryConfig(tCategoriesConfig)

  const getCategoryLabel = (
    categoryKey: CategoryKeyType,
    customCategories?: Category[]
  ): string => {
    return getLabel(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoryDescription = (
    categoryKey: CategoryKeyType,
    customCategories?: Category[]
  ): string => {
    return getDescription(categoryKey, CATEGORY_CONFIG, customCategories)
  }

  const getCategoriesWithDetails = (type: TransactionType) => {
    return getDetails(type, CATEGORY_CONFIG)
  }

  return { getCategoryLabel, getCategoryDescription, getCategoriesWithDetails }
}
