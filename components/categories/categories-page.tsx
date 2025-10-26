"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"
import { BasePage } from "@/components/layout/base-page"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations("categories")
  const tCommon = useTranslations("common")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{t("title")}</div>
            <div className="description">{t("pageDescription")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>{tCommon("add")}</Button>
        </div>

        <CategoryFilters />
      </BasePage>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
