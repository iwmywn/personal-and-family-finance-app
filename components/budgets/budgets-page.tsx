"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { BudgetsFilters } from "@/components/budgets/budgets-filters"

export default function BudgetsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tBudgetsFE = useTranslations("budgets.fe")
  const tCommonFE = useTranslations("common.fe")
  const tNavigation = useTranslations("navigation")

  return (
    <>
      <div className="header">
        <div>
          <div className="title">{tNavigation("budgets")}</div>
          <div className="description">{tBudgetsFE("description")}</div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>{tCommonFE("add")}</Button>
      </div>

      <BudgetsFilters />

      <BudgetDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
