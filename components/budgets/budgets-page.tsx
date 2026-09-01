"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { BudgetDialog } from "@/components/budgets/budget-dialog"
import { BudgetFilters } from "@/components/budgets/budget-filters"

export default function BudgetsPage() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="page-content">
        <div className="header">
          <div>
            <div className="title">{t("Budgets")}</div>
            <div className="description">
              {t("Set and manage budgets for your outflow categories.")}
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)}>{t("Add")}</Button>
        </div>

        <BudgetFilters />
      </div>

      <BudgetDialog open={isOpen} setOpen={setIsOpen} />
    </>
  )
}
