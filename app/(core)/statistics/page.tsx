import { Metadata } from "next"

import { StatisticsPage } from "@/components/statistics/statistics-page"

export function generateMetadata(): Metadata {
  return {
    title: "Thống kê",
    description: "Xem thống kê chi tiết về thu chi của bạn",
  }
}

export default function page() {
  return <StatisticsPage />
}
