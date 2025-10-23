"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryFilters } from "@/components/categories/category-filters"
import { useCustomCategories, useTransactions, useUser } from "@/lib/swr"

export default function CategoriesPage() {
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
            <div className="title">Danh mục tùy chỉnh</div>
            <div className="description">
              Quản lý các danh mục tùy chỉnh cho giao dịch của bạn.
            </div>
          </div>
          <Button onClick={() => setIsEditOpen(true)}>Thêm</Button>
        </div>

        <CategoryFilters />
      </div>

      <CategoryDialog open={isEditOpen} setOpen={setIsEditOpen} />
    </>
  )
}
