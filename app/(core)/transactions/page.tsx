import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import TransactionsPage from "@/components/transactions/transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("navigation.transactions") }
}

export default function page() {
  return <TransactionsPage />
}
