import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import BudgetsPage from "@/components/budgets/budgets-page"
import { PageDataProvider } from "@/components/layout/page-data-provider"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Budgets") }
}

export default function page() {
  return (
    <PageDataProvider budgets transactions categories>
      <BudgetsPage />
    </PageDataProvider>
  )
}
