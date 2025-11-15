import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import GoalsPage from "@/components/goals/goals-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("navigation.goals") }
}

export default function page() {
  return <GoalsPage />
}
