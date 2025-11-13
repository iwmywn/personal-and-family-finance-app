import type { TypedTranslationFunction } from "@/i18n/types"
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

type CategoryConfigType = {
  [K in AllCategoriesKeyType]: {
    label: string
    description: string
    type: TransactionType
  }
}

export function createCategoryConfig(
  t: TypedTranslationFunction
): CategoryConfigType {
  const CATEGORY_CONFIG: CategoryConfigType = {
    // Incomes
    salary_bonus: {
      label: t("categoriesConfig.salaryBonus.label"),
      description: t("categoriesConfig.salaryBonus.description"),
      type: "income",
    },
    business_freelance: {
      label: t("categoriesConfig.businessFreelance.label"),
      description: t("categoriesConfig.businessFreelance.description"),
      type: "income",
    },
    investment_passive: {
      label: t("categoriesConfig.investmentPassive.label"),
      description: t("categoriesConfig.investmentPassive.description"),
      type: "income",
    },
    gift_support: {
      label: t("categoriesConfig.giftSupport.label"),
      description: t("categoriesConfig.giftSupport.description"),
      type: "income",
    },
    other_income: {
      label: t("categoriesConfig.otherIncome.label"),
      description: t("categoriesConfig.otherIncome.description"),
      type: "income",
    },
    // Expenses
    food_beverage: {
      label: t("categoriesConfig.foodBeverage.label"),
      description: t("categoriesConfig.foodBeverage.description"),
      type: "expense",
    },
    transportation: {
      label: t("categoriesConfig.transportation.label"),
      description: t("categoriesConfig.transportation.description"),
      type: "expense",
    },
    personal_care: {
      label: t("categoriesConfig.personalCare.label"),
      description: t("categoriesConfig.personalCare.description"),
      type: "expense",
    },
    shopping: {
      label: t("categoriesConfig.shopping.label"),
      description: t("categoriesConfig.shopping.description"),
      type: "expense",
    },
    family_support: {
      label: t("categoriesConfig.familySupport.label"),
      description: t("categoriesConfig.familySupport.description"),
      type: "expense",
    },
    housing: {
      label: t("categoriesConfig.housing.label"),
      description: t("categoriesConfig.housing.description"),
      type: "expense",
    },
    healthcare_insurance: {
      label: t("categoriesConfig.healthcareInsurance.label"),
      description: t("categoriesConfig.healthcareInsurance.description"),
      type: "expense",
    },
    education_development: {
      label: t("categoriesConfig.educationDevelopment.label"),
      description: t("categoriesConfig.educationDevelopment.description"),
      type: "expense",
    },
    entertainment_leisure: {
      label: t("categoriesConfig.entertainmentLeisure.label"),
      description: t("categoriesConfig.entertainmentLeisure.description"),
      type: "expense",
    },
    social_gifts: {
      label: t("categoriesConfig.socialGifts.label"),
      description: t("categoriesConfig.socialGifts.description"),
      type: "expense",
    },
    savings_investment: {
      label: t("categoriesConfig.savingsInvestment.label"),
      description: t("categoriesConfig.savingsInvestment.description"),
      type: "expense",
    },
    debt_payment: {
      label: t("categoriesConfig.debtPayment.label"),
      description: t("categoriesConfig.debtPayment.description"),
      type: "expense",
    },
    other_expense: {
      label: t("categoriesConfig.otherExpense.label"),
      description: t("categoriesConfig.otherExpense.description"),
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
