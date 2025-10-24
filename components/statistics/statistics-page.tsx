"use client"

import { useState } from "react"

import { BasePage } from "@/components/layout/base-page"
import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"

export function StatisticsPage() {
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  return (
    <>
      <BasePage>
        <div className="header">
          <div>
            <div className="title">Thống kê</div>
            <div className="description">
              Thống kê tất cả giao dịch thu chi của bạn.
            </div>
          </div>
        </div>

        <StatisticsFilters />
      </BasePage>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
