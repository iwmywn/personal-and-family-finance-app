export const CATEGORIES = ["inflow", "outflow"] as const
export type CategoryType = (typeof CATEGORIES)[number]

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
export type AllCategoriesKeyType = (typeof _ALL_CATEGORIES_KEY)[number]

export type CategoryKeyType = AllCategoriesKeyType | string

export type CategoryConfigBaseType = {
  [K in AllCategoriesKeyType]: {
    label: string
    description: string
  }
}

export function getCategoryType(key: AllCategoriesKeyType): CategoryType {
  return (INFLOW_CATEGORIES_KEY as readonly string[]).includes(key)
    ? "inflow"
    : "outflow"
}
