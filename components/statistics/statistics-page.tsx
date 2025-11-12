"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export default function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tStatisticsFE = useTranslations("statistics.fe")
  const tNavigation = useTranslations("navigation")

  return (
    <>
      <div className="header">
        <div>
          <div className="title">{tNavigation("statistics")}</div>
          <div className="description">{tStatisticsFE("description")}</div>
        </div>
      </div>

      <StatisticsFilters />

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
