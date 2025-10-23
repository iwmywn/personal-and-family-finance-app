import type { Metadata } from "next"

import CategoriesPage from "@/components/categories/categories-page"

export function generateMetadata(): Metadata {
  return { title: "Danh mục" }
}

export default function page() {
  return <CategoriesPage />
}
