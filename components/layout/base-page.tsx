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
import { useAppData } from "@/lib/app-data-context"

export function BasePage({ children }: { children: ReactNode }) {
  const tBasePage = useTranslations("basePage")
  const { user, transactions, customCategories, budgets } = useAppData()

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
