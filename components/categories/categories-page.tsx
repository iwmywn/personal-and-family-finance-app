"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"
import { BasePage } from "@/components/layout/base-page"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tCategoriesFE = useTranslations("categories.fe")
  const tCommonFE = useTranslations("common.fe")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{tCategoriesFE("title")}</div>
            <div className="description">{tCategoriesFE("description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {tCommonFE("add")}
          </Button>
        </div>

        <CategoryFilters />
      </BasePage>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
