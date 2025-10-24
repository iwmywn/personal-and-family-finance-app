"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TransactionDialog } from "@/components/transactions/transaction-dialog"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { useCustomCategories, useTransactions, useUser } from "@/lib/swr"

export default function TransactionsPage() {
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { customCategories, isCategoriesLoading } = useCustomCategories()
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
            <div className="title">Giao dịch</div>
            <div className="description">
              Quản lý tất cả giao dịch thu chi của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>

        <TransactionFilters />
      </div>

      <TransactionDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
