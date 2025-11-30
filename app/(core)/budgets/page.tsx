import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import BudgetsPage from "@/components/budgets/budgets-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Budgets") }
}

export default function page() {
  return <BudgetsPage />
}
