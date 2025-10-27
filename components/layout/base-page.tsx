"use client"

import { ReactNode } from "react"
import { Ghost } from "lucide-react"
import { useTranslations } from "next-intl"

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
  const tBasePage = useTranslations("basePage")
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
          <EmptyTitle>{tBasePage("userDataError.title")}</EmptyTitle>
          <EmptyDescription>
            {tBasePage("userDataError.description")}
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
          <EmptyTitle>{tBasePage("transactionsDataError.title")}</EmptyTitle>
          <EmptyDescription>
            {tBasePage("transactionsDataError.description")}
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
          <EmptyTitle>{tBasePage("categoriesDataError.title")}</EmptyTitle>
          <EmptyDescription>
            {tBasePage("categoriesDataError.description")}
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
