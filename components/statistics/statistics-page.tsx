"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { BasePage } from "@/components/layout/base-page"
import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tStatistics = useTranslations("statistics")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{tStatistics("title")}</div>
            <div className="description">{tStatistics("description")}</div>
          </div>
        </div>

        <StatisticsFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
