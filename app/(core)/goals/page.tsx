import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import GoalsPage from "@/components/goals/goals-page"
import { PageDataProvider } from "@/components/layout/page-data-provider"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Goals") }
}

export default function page() {
  return (
    <PageDataProvider goals transactions categories>
      <GoalsPage />
    </PageDataProvider>
  )
}
