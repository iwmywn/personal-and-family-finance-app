import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import BudgetsPage from "@/components/budgets/budgets-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("navigation.budgets") }
}

export default function page() {
  return <BudgetsPage />
}
