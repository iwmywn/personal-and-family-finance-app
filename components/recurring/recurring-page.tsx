"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { RecurringDialog } from "@/components/recurring/recurring-dialog"
import { RecurringFilters } from "@/components/recurring/recurring-filters"

export default function RecurringPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div className="h-auto max-h-none space-y-4 lg:h-full lg:max-h-[calc(100vh-4.375rem)]">
        <div className="header">
          <div>
            <div className="title">{t("navigation.recurring")}</div>
            <div className="description">{t("recurring.fe.description")}</div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>
            {t("common.fe.add")}
          </Button>
        </div>

        <RecurringFilters />
      </div>

      <RecurringDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
