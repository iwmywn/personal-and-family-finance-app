import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import RecurringPage from "@/components/recurring/recurring-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("navigation.recurring") }
}

export default function page() {
  return <RecurringPage />
}
