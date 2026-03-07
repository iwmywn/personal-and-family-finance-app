import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import { PageDataProvider } from "@/components/layout/page-data-provider"
import StatisticsPage from "@/components/statistics/statistics-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Statistics") }
}

export default function page() {
  return (
    <PageDataProvider transactions categories>
      <StatisticsPage />
    </PageDataProvider>
  )
}
