import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import CategoriesPage from "@/components/categories/categories-page"

export async function generateMetadata(): Promise<Metadata> {
  const tCategoriesFE = await getTranslations("categories.fe")

  return { title: tCategoriesFE("title") }
}

export default function page() {
  return <CategoriesPage />
}
