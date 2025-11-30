import type { Metadata } from "next"
import { getExtracted } from "next-intl/server"

import CategoriesPage from "@/components/categories/categories-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted()

  return { title: t("Categories") }
}

export default function page() {
  return <CategoriesPage />
}
