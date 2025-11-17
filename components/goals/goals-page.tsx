"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { GoalDialog } from "@/components/goals/goal-dialog"
import { GoalsFilters } from "@/components/goals/goals-filters"

export default function GoalsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("navigation.goals")}</div>
            <div className="description">{t("goals.fe.description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {t("common.fe.add")}
          </Button>
        </div>

        <GoalsFilters />
      </div>

      <GoalDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
