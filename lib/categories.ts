export const CATEGORY_TYPES = ["income", "expense"] as const
export type CategoryType = (typeof CATEGORY_TYPES)[number]

const INCOME_CATEGORIES_KEY = [
  "salary_bonus",
  "business_freelance",
  "investment_passive",
  "gift_support",
  "other_income",
] as const

const EXPENSE_CATEGORIES_KEY = [
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

const _ALL_CATEGORIES_KEY = [
  ...INCOME_CATEGORIES_KEY,
  ...EXPENSE_CATEGORIES_KEY,
] as const
type AllCategoriesKeyType = (typeof _ALL_CATEGORIES_KEY)[number]

export type CategoryKeyType = AllCategoriesKeyType | string

export type CategoryConfigType = {
  [K in AllCategoriesKeyType]: {
    label: string
    description: string
    type: CategoryType
  }
}
