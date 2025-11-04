"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { BasePage } from "@/components/layout/base-page"
import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export default function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const tStatisticsFE = useTranslations("statistics.fe")

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">{tStatisticsFE("title")}</div>
            <div className="description">{tStatisticsFE("description")}</div>
          </div>
        </div>

        <StatisticsFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
