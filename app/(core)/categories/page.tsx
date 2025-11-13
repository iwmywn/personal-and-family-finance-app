import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import CategoriesPage from "@/components/categories/categories-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()

  return { title: t("navigation.categories") }
}

export default function page() {
  return <CategoriesPage />
}
