import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import BudgetsPage from "@/components/budgets/budgets-page"

export async function generateMetadata(): Promise<Metadata> {
  const tNavigation = await getTranslations("navigation")

  return { title: tNavigation("budgets") }
}

export default function page() {
  return <BudgetsPage />
}
