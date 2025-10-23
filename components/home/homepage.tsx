"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { QuickStats } from "@/components/home/quick-stats"
import { RecentTransactions } from "@/components/home/recent-transactions"
import { TransactionSummary } from "@/components/home/transaction-summary"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { useDynamicSizeAuto } from "@/hooks/use-dynamic-size-auto"
import { useCustomCategories, useTransactions, useUser } from "@/lib/swr"

export default function HomePage() {
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { categories: customCategories, isCategoriesLoading } =
    useCustomCategories()
  const { registerRef, calculatedHeight } = useDynamicSizeAuto()
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
        <div ref={registerRef} className="header">
          <div>
            <div className="title">Xin chào, {user.fullName}!</div>
            <div className="description">
              Quản lý tài chính cá nhân của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>

        <div ref={registerRef}>
          <TransactionSummary />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <RecentTransactions offsetHeight={calculatedHeight} />
          <QuickStats offsetHeight={calculatedHeight} />
        </div>
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
