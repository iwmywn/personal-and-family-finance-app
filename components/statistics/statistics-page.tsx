"use client"

import { useState } from "react"
import { useExtracted } from "next-intl"

import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export default function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const t = useExtracted()

  return (
    <>
      <div className="h-auto max-h-none space-y-4">
        <div className="header">
          <div>
            <div className="title">{t("Statistics")}</div>
            <div className="description">
              {t("View your financial statistics.")}
            </div>
          </div>
        </div>

        <StatisticsFilters />
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
