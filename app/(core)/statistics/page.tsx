import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import StatisticsPage from "@/components/statistics/statistics-page"

export async function generateMetadata(): Promise<Metadata> {
  const tNavigation = await getTranslations("navigation")

  return { title: tNavigation("statistics") }
}

export default function page() {
  return <StatisticsPage />
}
