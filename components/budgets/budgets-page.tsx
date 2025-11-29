"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { BudgetsFilters } from "@/components/budgets/budgets-filters"

export default function BudgetsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("Budgets")}</div>
            <div className="description">
              {t("Set and manage budgets for your expense categories.")}
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>{t("Add")}</Button>
        </div>

        <BudgetsFilters />
      </div>

      <BudgetDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
