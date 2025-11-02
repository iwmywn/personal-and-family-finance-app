import type { TypedTranslationFunction } from "@/i18n/types"

import type { CustomCategory } from "@/lib/definitions"

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

type CategoryConfigType = {
  [K in AllCategoriesKeyType]: {
    label: string
    description: string
    type: TransactionType
  }
}

export function createCategoryConfig(
  t: TypedTranslationFunction<"categoriesConfig">
): CategoryConfigType {
  const CATEGORY_CONFIG: CategoryConfigType = {
    // Incomes
    salary_bonus: {
      label: t("salaryBonus.label"),
      description: t("salaryBonus.description"),
      type: "income",
    },
    business_freelance: {
      label: t("businessFreelance.label"),
      description: t("businessFreelance.description"),
      type: "income",
    },
    investment_passive: {
      label: t("investmentPassive.label"),
      description: t("investmentPassive.description"),
      type: "income",
    },
    gift_support: {
      label: t("giftSupport.label"),
      description: t("giftSupport.description"),
      type: "income",
    },
    other_income: {
      label: t("otherIncome.label"),
      description: t("otherIncome.description"),
      type: "income",
    },
    // Expenses
    food_beverage: {
      label: t("foodBeverage.label"),
      description: t("foodBeverage.description"),
      type: "expense",
    },
    transportation: {
      label: t("transportation.label"),
      description: t("transportation.description"),
      type: "expense",
    },
    personal_care: {
      label: t("personalCare.label"),
      description: t("personalCare.description"),
      type: "expense",
    },
    shopping: {
      label: t("shopping.label"),
      description: t("shopping.description"),
      type: "expense",
    },
    family_support: {
      label: t("familySupport.label"),
      description: t("familySupport.description"),
      type: "expense",
    },
    housing: {
      label: t("housing.label"),
      description: t("housing.description"),
      type: "expense",
    },
    healthcare_insurance: {
      label: t("healthcareInsurance.label"),
      description: t("healthcareInsurance.description"),
      type: "expense",
    },
    education_development: {
      label: t("educationDevelopment.label"),
      description: t("educationDevelopment.description"),
      type: "expense",
    },
    entertainment_leisure: {
      label: t("entertainmentLeisure.label"),
      description: t("entertainmentLeisure.description"),
      type: "expense",
    },
    social_gifts: {
      label: t("socialGifts.label"),
      description: t("socialGifts.description"),
      type: "expense",
    },
    savings_investment: {
      label: t("savingsInvestment.label"),
      description: t("savingsInvestment.description"),
      type: "expense",
    },
    debt_payment: {
      label: t("debtPayment.label"),
      description: t("debtPayment.description"),
      type: "expense",
    },
    other_expense: {
      label: t("otherExpense.label"),
      description: t("otherExpense.description"),
      type: "expense",
    },
  }

  return CATEGORY_CONFIG
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
  customCategories?: CustomCategory[]
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
  customCategories?: CustomCategory[]
): string {
  return getProperty(categoryKey, CATEGORY_CONFIG, "label", customCategories)
}

export function getDescription(
  categoryKey: CategoryKeyType,
  CATEGORY_CONFIG: CategoryConfigType,
  customCategories?: CustomCategory[]
): string {
  return getProperty(
    categoryKey,
    CATEGORY_CONFIG,
    "description",
    customCategories
  )
}
