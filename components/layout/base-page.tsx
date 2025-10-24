"use client"

import { ReactNode } from "react"
import { Ghost } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useCustomCategories, useTransactions, useUser } from "@/lib/swr"

export function BasePage({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { customCategories, isCategoriesLoading } = useCustomCategories()

  if (isUserLoading || isTransactionsLoading || isCategoriesLoading) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost />
          </EmptyMedia>
          <EmptyTitle>KHÔNG THỂ LẤY DỮ LIỆU NGƯỜI DÙNG</EmptyTitle>
          <EmptyDescription>
            Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!transactions) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost />
          </EmptyMedia>
          <EmptyTitle>KHÔNG THỂ LẤY DỮ LIỆU GIAO DỊCH</EmptyTitle>
          <EmptyDescription>
            Đã xảy ra lỗi khi tải giao dịch. Vui lòng thử lại sau.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (!customCategories) {
    return (
      <Empty className="h-full border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost />
          </EmptyMedia>
          <EmptyTitle>KHÔNG THỂ LẤY DỮ LIỆU DANH MỤC</EmptyTitle>
          <EmptyDescription>
            Đã xảy ra lỗi khi tải danh mục. Vui lòng thử lại sau.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="space-y-4">{children}</div>
    </>
  )
}
