export const CATEGORY_TYPES = ["inflow", "outflow"] as const
export type CategoryType = (typeof CATEGORY_TYPES)[number]

const INFLOW_CATEGORIES_KEY = [
  "salary_bonus",
  "business_freelance",
  "investment_passive",
  "gift_support",
  "debt_collection",
  "other_inflow",
] as const

const OUTFLOW_CATEGORIES_KEY = [
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
  "other_outflow",
] as const

const _ALL_CATEGORIES_KEY = [
  ...INFLOW_CATEGORIES_KEY,
  ...OUTFLOW_CATEGORIES_KEY,
] as const
export type CategoryKey = (typeof _ALL_CATEGORIES_KEY)[number] | string

export type CategoryConfig = {
  [K in CategoryKey]: {
    label: string
    description: string
  }
}

export function getCategoryType(key: CategoryKey): CategoryType {
  return (INFLOW_CATEGORIES_KEY as readonly string[]).includes(key)
    ? "inflow"
    : "outflow"
}
