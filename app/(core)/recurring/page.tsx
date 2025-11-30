import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import RecurringTransactionsPage from "@/components/recurring-transactions/recurring-transactions-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Recurring Transactions") }
}

export default function page() {
  return <RecurringTransactionsPage />
}
