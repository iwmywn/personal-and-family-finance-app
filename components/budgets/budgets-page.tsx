"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { BudgetsFilters } from "@/components/budgets/budgets-filters"

export default function BudgetsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div className="header">
        <div>
          <div className="title">{t("navigation.budgets")}</div>
          <div className="description">{t("budgets.fe.description")}</div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          {t("common.fe.add")}
        </Button>
      </div>

      <BudgetsFilters />

      <BudgetDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
