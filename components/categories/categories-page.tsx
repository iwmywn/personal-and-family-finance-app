"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div>
        <div className="header">
          <div>
            <div className="title">{t("navigation.categories")}</div>
            <div className="description">{t("categories.fe.description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {t("common.fe.add")}
          </Button>
        </div>

        <CategoryFilters />
      </div>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
