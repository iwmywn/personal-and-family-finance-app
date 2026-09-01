"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { GoalDialog } from "@/components/goals/goal-dialog"
import { GoalFilters } from "@/components/goals/goal-filters"

export default function GoalsPage() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="page-content">
        <div className="header">
          <div>
            <div className="title">{t("Goals")}</div>
            <div className="description">
              {t("Set and track your financial goals.")}
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)}>{t("Add")}</Button>
        </div>

        <GoalFilters />
      </div>

      <GoalDialog open={isOpen} setOpen={setIsOpen} />
    </>
  )
}
