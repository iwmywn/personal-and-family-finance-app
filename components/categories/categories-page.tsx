"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"

export default function CategoriesPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="page-content">
        <div className="header">
          <div>
            <div className="title">{t("Categories")}</div>
            <div className="description">
              {t("Manage your custom categories.")}
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>{t("Add")}</Button>
        </div>

        <CategoryFilters />
      </div>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
