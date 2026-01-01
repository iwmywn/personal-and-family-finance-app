"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { Button } from "@/components/ui/button"
import { GoalDialog } from "@/components/goals/goal-dialog"
import { GoalFilters } from "@/components/goals/goal-filters"

export default function GoalsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
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
          <Button onClick={() => setIsEditOpen(true)}>{t("Add")}</Button>
        </div>

        <GoalFilters />
      </div>

      <GoalDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
