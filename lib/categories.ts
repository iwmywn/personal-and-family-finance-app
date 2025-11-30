import type { Category } from "@/lib/definitions"

export const TRANSACTION_TYPES = ["income", "expense"] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const INCOME_CATEGORIES_KEY = [
  "salary_bonus",
  "business_freelance",
  "investment_passive",
  "gift_support",
  "other_income",
] as const

export const EXPENSE_CATEGORIES_KEY = [
  "food_beverage",
  "transportation",
  "personal_care",
  "shopping",
  "family_support",
  "housing",
  "healthcare_insurance",
  "education_development",
  "entertainment_leisure",
  "social_gifts",
  "savings_investment",
  "debt_payment",
  "other_expense",
] as const

export const ALL_CATEGORIES_KEY = [
  ...INCOME_CATEGORIES_KEY,
  ...EXPENSE_CATEGORIES_KEY,
] as const
type AllCategoriesKeyType = (typeof ALL_CATEGORIES_KEY)[number]

export type CategoryKeyType = AllCategoriesKeyType | string

export type CategoryConfigType = {
  [K in AllCategoriesKeyType]: {
    label: string
    description: string
    type: TransactionType
  }
}

interface CategoryDetail {
  label: string
  description: string
  categoryKey: CategoryKeyType
}

export function getDetails(
  type: TransactionType,
  CATEGORY_CONFIG: CategoryConfigType
): CategoryDetail[] {
  return Object.entries(CATEGORY_CONFIG)
    .filter(([_, config]) => config.type === type)
    .map(([categoryKey, config]) => ({
      label: config.label,
      description: config.description,
      categoryKey: categoryKey as CategoryKeyType,
    }))
}

function getProperty(
  categoryKey: CategoryKeyType,
  CATEGORY_CONFIG: CategoryConfigType,
  property: "label" | "description",
  customCategories?: Category[]
): string {
  if (categoryKey in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[categoryKey as AllCategoriesKeyType][property]
  }
  return (
    customCategories?.find((c) => c.categoryKey === categoryKey)?.[property] ||
    ""
  )
}

export function getLabel(
  categoryKey: CategoryKeyType,
  CATEGORY_CONFIG: CategoryConfigType,
  customCategories?: Category[]
): string {
  return getProperty(categoryKey, CATEGORY_CONFIG, "label", customCategories)
}

export function getDescription(
  categoryKey: CategoryKeyType,
  CATEGORY_CONFIG: CategoryConfigType,
  customCategories?: Category[]
): string {
  return getProperty(
    categoryKey,
    CATEGORY_CONFIG,
    "description",
    customCategories
  )
}
