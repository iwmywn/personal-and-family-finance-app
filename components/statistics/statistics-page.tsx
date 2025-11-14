"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export default function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useTranslations()

  return (
    <>
      <div className="h-auto max-h-none space-y-4">
        <div className="header">
          <div>
            <div className="title">{t("navigation.statistics")}</div>
            <div className="description">{t("statistics.fe.description")}</div>
          </div>
        </div>

        <StatisticsFilters />
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
