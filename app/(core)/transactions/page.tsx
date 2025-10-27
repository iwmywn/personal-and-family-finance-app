import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import TransactionsPage from "@/components/transactions/transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const tTransactionsFE = await getTranslations("transactions.fe")

  return { title: tTransactionsFE("title") }
}

export default function page() {
  return <TransactionsPage />
}
