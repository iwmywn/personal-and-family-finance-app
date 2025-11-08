"use client"

import { type ReactNode } from "react"
import { Ghost } from "lucide-react"
import { useTranslations, type Messages } from "next-intl"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  useBudgets,
  useCustomCategories,
  useTransactions,
  useUser,
} from "@/lib/swr"

export function BasePage({ children }: { children: ReactNode }) {
  const tBasePage = useTranslations("basePage")
  const { user, isUserLoading } = useUser()
  const { transactions, isTransactionsLoading } = useTransactions()
  const { customCategories, isCategoriesLoading } = useCustomCategories()
  const { budgets, isBudgetsLoading } = useBudgets()

  if (
    isUserLoading ||
    isTransactionsLoading ||
    isCategoriesLoading ||
    isBudgetsLoading
  ) {
    return (
      <div className="center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const renderEmptyState = (key: keyof Messages["basePage"]) => (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ghost />
        </EmptyMedia>
        <EmptyTitle>{tBasePage(`${key}.title`)}</EmptyTitle>
        <EmptyDescription>{tBasePage(`${key}.description`)}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )

  if (!user) return renderEmptyState("userDataError")
  if (!transactions) return renderEmptyState("transactionsDataError")
  if (!customCategories) return renderEmptyState("categoriesDataError")
  if (!budgets) return renderEmptyState("budgetsDataError")

  return (
    <>
      <div className="space-y-4">{children}</div>
    </>
  )
}
