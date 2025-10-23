"use client"

import { useState } from "react"

import { Spinner } from "@/components/ui/spinner"
import { StatisticsFilters } from "@/components/statistics/statistics-filters"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useCustomCategories, useTransactions, useUser } from "@/lib/swr"

export function StatisticsPage() {
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { categories: customCategories, isCategoriesLoading } =
    useCustomCategories()
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)

  if (isUserLoading || isTransactionsLoading || isCategoriesLoading) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) {
    return <div className="center">Không thể tải thông tin người dùng!</div>
  }

  if (!transactions) {
    return <div className="center">Không thể tải giao dịch!</div>
  }

  if (!customCategories) {
    return <div className="center">Không thể tải danh mục!</div>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="header">
          <div>
            <div className="title">Phân tích</div>
            <div className="description">
              Phân tích chi tiết về thu chi của bạn.
            </div>
          </div>
        </div>

        <StatisticsFilters />
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
