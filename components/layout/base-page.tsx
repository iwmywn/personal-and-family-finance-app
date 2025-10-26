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
  const t = useTranslations("basePage")
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
          <EmptyTitle>{t("userDataError.title")}</EmptyTitle>
          <EmptyDescription>{t("userDataError.description")}</EmptyDescription>
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
          <EmptyTitle>{t("transactionsDataError.title")}</EmptyTitle>
          <EmptyDescription>
            {t("transactionsDataError.description")}
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
          <EmptyTitle>{t("categoriesDataError.title")}</EmptyTitle>
          <EmptyDescription>
            {t("categoriesDataError.description")}
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
