import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import TransactionsPage from "@/components/transactions/transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Transactions") }
}

export default function page() {
  return <TransactionsPage />
}
