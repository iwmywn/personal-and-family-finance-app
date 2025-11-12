"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tCategoriesFE = useTranslations("categories.fe")
  const tCommonFE = useTranslations("common.fe")
  const tNavigation = useTranslations("navigation")

  return (
    <>
      <div className="header">
        <div>
          <div className="title">{tNavigation("categories")}</div>
          <div className="description">{tCategoriesFE("description")}</div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>{tCommonFE("add")}</Button>
      </div>

      <CategoryFilters />

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
