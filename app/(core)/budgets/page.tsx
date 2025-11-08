import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import BudgetsPage from "@/components/budgets/budgets-page"

export async function generateMetadata(): Promise<Metadata> {
  const tBudgetsFE = await getTranslations("budgets.fe")

  return { title: tBudgetsFE("title") }
}

export default function page() {
  return <BudgetsPage />
}
