"use client"

import { useExtracted } from "next-intl"

import { useAppData } from "@/context/app-data-context"
import {
  getCategoryType,
  type AllCategoriesKeyType,
  type CategoryConfigBaseType,
  type CategoryKeyType,
  type CategoryType,
} from "@/lib/categories"

export function useCategory() {
  const t = useExtracted()
  const { customCategories } = useAppData()

  const CATEGORY_CONFIG_BASE: CategoryConfigBaseType = {
    // Incomes
    salary_bonus: {
      label: t("Salary & Bonus"),
      description: t(
        "Base salary, performance bonus, holiday bonus, allowances, etc."
      ),
    },
    business_freelance: {
      label: t("Business & Freelance"),
      description: t(
        "Sales revenue, services, freelance, short-term contracts, etc."
      ),
    },
    investment_passive: {
      label: t("Investment & Passive Income"),
      description: t(
        "Savings interest, dividends, bonds interest, rental, royalties, etc."
      ),
    },
    gift_support: {
      label: t("Gifts & Support"),
      description: t("Cash gifts, family support, celebration money, etc."),
    },
    other_income: {
      label: t("Other Income"),
      description: t(
        "Refunds, selling used items, prizes, unexpected amounts, etc."
      ),
    },

    // Expenses
    food_beverage: {
      label: t("Food & Beverage"),
      description: t(
        "Groceries, markets, restaurants, cafes, breakfast/lunch/dinner, etc."
      ),
    },
    transportation: {
      label: t("Transportation"),
      description: t("Fuel, bus/grab, vehicle maintenance, parking fees, etc."),
    },
    personal_care: {
      label: t("Personal Care"),
      description: t(
        "Haircut, manicure, spa, massage, hair dye, skincare, etc."
      ),
    },
    shopping: {
      label: t("Shopping"),
      description: t(
        "Clothes, shoes, cosmetics, accessories, electronics, household items, etc."
      ),
    },
    family_support: {
      label: t("Family Support"),
      description: t(
        "Money for parents, support for siblings, relatives, etc."
      ),
    },
    housing: {
      label: t("Housing & Utilities"),
      description: t(
        "Rent, electricity, water, gas, internet, phone, management fees, etc."
      ),
    },
    healthcare_insurance: {
      label: t("Healthcare & Insurance"),
      description: t("Medical visits, medicine, health/life insurance, etc."),
    },
    education_development: {
      label: t("Education & Development"),
      description: t(
        "Tuition, books, online/offline courses, certificates, seminars, etc."
      ),
    },
    entertainment_leisure: {
      label: t("Entertainment & Leisure"),
      description: t("Travel, movies, music, games, gym, hobbies, etc."),
    },
    social_gifts: {
      label: t("Social & Gifts"),
      description: t(
        "Weddings, funerals, birthdays, gifts for friends, gatherings, etc."
      ),
    },
    savings_investment: {
      label: t("Savings & Investment"),
      description: t(
        "Savings, stocks, funds, real estate, crypto, emergency fund, etc."
      ),
    },
    debt_payment: {
      label: t("Debt Payment"),
      description: t("Bank loan payments, credit cards, personal debts, etc."),
    },
    other_expense: {
      label: t("Other Expenses"),
      description: t(
        "Unexpected repairs, fines, losses, unidentified expenses, etc."
      ),
    },
  } as const

  const categories = [
    ...(customCategories?.map((c) => ({
      key: c.categoryKey,
      label: c.label,
      description: c.description,
      type: c.type,
    })) ?? []),

    ...Object.entries(CATEGORY_CONFIG_BASE).map(([key, value]) => ({
      key,
      ...value,
      type: getCategoryType(key as AllCategoriesKeyType),
    })),
  ]

  const getCategoryLabel = (key: CategoryKeyType): string => {
    return categories.find((c) => c.key === key)?.label ?? ""
  }

  const getCategoryDescription = (key: CategoryKeyType): string => {
    return categories.find((c) => c.key === key)?.description ?? ""
  }

  const getCategoriesByType = (type: CategoryType) => {
    return categories.filter((c) => c.type === type)
  }

  return {
    getCategoryLabel,
    getCategoryDescription,
    getCategoriesByType,
  }
}
