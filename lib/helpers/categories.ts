import { CATEGORY_CONFIG } from "@/lib/categories"
import type {
  CustomCategory,
  TransactionCategoryKey,
  TransactionType,
} from "@/lib/definitions"

interface CategoryDetail {
  label: string
  description: string
  categoryKey: TransactionCategoryKey
}

export function getCategoriesWithDetails(
  type: TransactionType
): CategoryDetail[] {
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
): string {
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
): string {
  return getCategoryProperty(categoryKey, "label", customCategories)
}

export function getCategoryDescription(
  categoryKey: TransactionCategoryKey,
  customCategories?: CustomCategory[]
): string {
  return getCategoryProperty(categoryKey, "description", customCategories)
}
