import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import StatisticsPage from "@/components/statistics/statistics-page"

export async function generateMetadata(): Promise<Metadata> {
  const tStatisticsFE = await getTranslations("statistics.fe")

  return { title: tStatisticsFE("title") }
}

export default function page() {
  return <StatisticsPage />
}
