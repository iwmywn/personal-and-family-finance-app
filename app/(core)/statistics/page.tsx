import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { StatisticsPage } from "@/components/statistics/statistics-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("statistics")
  return { title: t("title") }
}

export default function page() {
  return <StatisticsPage />
}
