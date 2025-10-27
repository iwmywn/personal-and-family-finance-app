import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import CategoriesPage from "@/components/categories/categories-page"

export async function generateMetadata(): Promise<Metadata> {
  const tCategories = await getTranslations("categories")

  return { title: tCategories("title") }
}

export default function page() {
  return <CategoriesPage />
}
