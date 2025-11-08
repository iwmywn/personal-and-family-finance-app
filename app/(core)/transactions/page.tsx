import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import TransactionsPage from "@/components/transactions/transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const tNavigation = await getTranslations("navigation")

  return { title: tNavigation("transactions") }
}

export default function page() {
  return <TransactionsPage />
}
