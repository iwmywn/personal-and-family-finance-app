import { Metadata } from "next"

import { StatisticsPage } from "@/components/statistics/statistics-page"

export const metadata: Metadata = {
  title: "Thống kê",
}

export default function page() {
  return <StatisticsPage />
}
