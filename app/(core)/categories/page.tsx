import type { Metadata } from "next"

import CategoryFilters from "@/components/categories/category-filters"

export function generateMetadata(): Metadata {
  return { title: "Danh mục" }
}

export default function page() {
  return <CategoryFilters />
}
