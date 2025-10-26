import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import TransactionsPage from "@/components/transactions/transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transactions")
  return { title: t("title") }
}

export default function page() {
  return <TransactionsPage />
}
