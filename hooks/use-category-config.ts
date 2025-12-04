"use client"

import { useExtracted } from "next-intl"

import { useAppData } from "@/context/app-data-context"
import type { CategoryConfigType } from "@/lib/categories"

export function useCategoryConfig() {
  const t = useExtracted()
  const { customCategories } = useAppData()

  const CATEGORY_CONFIG: CategoryConfigType = {
    // Incomes
    salary_bonus: {
      label: t("Salary & Bonus"),
      description: t(
        "Base salary, performance bonus, holiday bonus, allowances, etc."
      ),
      type: "income",
    },
    business_freelance: {
      label: t("Business & Freelance"),
      description: t(
        "Sales revenue, services, freelance, short-term contracts, etc."
      ),
      type: "income",
    },
    investment_passive: {
      label: t("Investment & Passive Income"),
      description: t(
        "Savings interest, dividends, bonds interest, rental, royalties, etc."
      ),
      type: "income",
    },
    gift_support: {
      label: t("Gifts & Support"),
      description: t("Cash gifts, family support, celebration money, etc."),
      type: "income",
    },
    other_income: {
      label: t("Other Income"),
      description: t(
        "Refunds, selling used items, prizes, unexpected amounts, etc."
      ),
      type: "income",
    },

    // Expenses
    food_beverage: {
      label: t("Food & Beverage"),
      description: t(
        "Groceries, markets, restaurants, cafes, breakfast/lunch/dinner, etc."
      ),
      type: "expense",
    },
    transportation: {
      label: t("Transportation"),
      description: t("Fuel, bus/grab, vehicle maintenance, parking fees, etc."),
      type: "expense",
    },
    personal_care: {
      label: t("Personal Care"),
      description: t(
        "Haircut, manicure, spa, massage, hair dye, skincare, etc."
      ),
      type: "expense",
    },
    shopping: {
      label: t("Shopping"),
      description: t(
        "Clothes, shoes, cosmetics, accessories, electronics, household items, etc."
      ),
      type: "expense",
    },
    family_support: {
      label: t("Family Support"),
      description: t(
        "Money for parents, support for siblings, relatives, etc."
      ),
      type: "expense",
    },
    housing: {
      label: t("Housing & Utilities"),
      description: t(
        "Rent, electricity, water, gas, internet, phone, management fees, etc."
      ),
      type: "expense",
    },
    healthcare_insurance: {
      label: t("Healthcare & Insurance"),
      description: t("Medical visits, medicine, health/life insurance, etc."),
      type: "expense",
    },
    education_development: {
      label: t("Education & Development"),
      description: t(
        "Tuition, books, online/offline courses, certificates, seminars, etc."
      ),
      type: "expense",
    },
    entertainment_leisure: {
      label: t("Entertainment & Leisure"),
      description: t("Travel, movies, music, games, gym, hobbies, etc."),
      type: "expense",
    },
    social_gifts: {
      label: t("Social & Gifts"),
      description: t(
        "Weddings, funerals, birthdays, gifts for friends, gatherings, etc."
      ),
      type: "expense",
    },
    savings_investment: {
      label: t("Savings & Investment"),
      description: t(
        "Savings, stocks, funds, real estate, crypto, emergency fund, etc."
      ),
      type: "expense",
    },
    debt_payment: {
      label: t("Debt Payment"),
      description: t("Bank loan payments, credit cards, personal debts, etc."),
      type: "expense",
    },
    other_expense: {
      label: t("Other Expenses"),
      description: t(
        "Unexpected repairs, fines, losses, unidentified expenses, etc."
      ),
      type: "expense",
    },
  }

  return [
    ...(customCategories?.map((c) => ({
      key: c.categoryKey,
      label: c.label,
      description: c.description,
      type: c.type,
    })) ?? []),

    ...Object.entries(CATEGORY_CONFIG).map(([key, value]) => ({
      key,
      ...value,
    })),
  ]
}
