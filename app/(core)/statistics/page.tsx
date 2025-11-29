import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import StatisticsPage from "@/components/statistics/statistics-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()
  return {
    title: t("Statistics"),
  }
}

export default function page() {
  return <StatisticsPage />
}
