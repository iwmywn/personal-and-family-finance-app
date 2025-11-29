import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import RecurringPage from "@/components/recurring/recurring-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Recurring Transactions") }
}

export default function page() {
  return <RecurringPage />
}
