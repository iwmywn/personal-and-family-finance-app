import * as React from "react"
import { redirect } from "next/navigation"
import { GhostIcon } from "lucide-react"
import { getExtracted } from "next-intl/server"

import { getBudgets } from "@/actions/budget.actions"
import { getCustomCategories } from "@/actions/category.actions"
import { getGoals } from "@/actions/goal.actions"
import { getRecurringTransactions } from "@/actions/recurring.actions"
import { getCurrentSession } from "@/actions/session.actions"
import { getTransactions } from "@/actions/transaction.actions"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { BudgetsProvider } from "@/context/budgets-context"
import { CategoriesProvider } from "@/context/categories-context"
import { GoalsProvider } from "@/context/goals-context"
import { RecurringProvider } from "@/context/recurring-context"
import { TransactionsProvider } from "@/context/transactions-context"
import type { AppCurrency } from "@/lib/currency"

export type PageDataProviderProps = {
  children: React.ReactNode
  transactions?: boolean
  categories?: boolean
  budgets?: boolean
  goals?: boolean
  recurring?: boolean
}

export async function PageDataProvider({
  children,
  transactions,
  categories,
  budgets,
  goals,
  recurring,
}: PageDataProviderProps) {
  const session = await getCurrentSession()
  if (!session) redirect("/signin")

  const userId = session.user.id
  const t = await getExtracted()
  const currency = session.user.currency as AppCurrency

  const [
    transactionsResult,
    categoriesResult,
    budgetsResult,
    goalsResult,
    recurringResult,
  ] = await Promise.all([
    transactions ? getTransactions(userId, currency) : Promise.resolve(null),
    categories ? getCustomCategories(userId) : Promise.resolve(null),
    budgets ? getBudgets(userId) : Promise.resolve(null),
    goals ? getGoals(userId) : Promise.resolve(null),
    recurring ? getRecurringTransactions(userId) : Promise.resolve(null),
  ])

  const renderEmptyState = (title: string, description?: string) => (
    <Empty className="h-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GhostIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description ?? t("Please try again later.")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )

  if (transactions && !transactionsResult?.transactions) {
    return renderEmptyState(
      t("CANNOT FETCH TRANSACTIONS DATA"),
      transactionsResult?.error
    )
  }

  if (categories && !categoriesResult?.customCategories) {
    return renderEmptyState(
      t("CANNOT FETCH CATEGORIES DATA"),
      categoriesResult?.error
    )
  }

  if (budgets && !budgetsResult?.budgets) {
    return renderEmptyState(
      t("CANNOT FETCH BUDGETS DATA"),
      budgetsResult?.error
    )
  }

  if (goals && !goalsResult?.goals) {
    return renderEmptyState(t("CANNOT FETCH GOALS DATA"), goalsResult?.error)
  }

  if (recurring && !recurringResult?.recurringTransactions) {
    return renderEmptyState(
      t("CANNOT FETCH RECURRING TRANSACTIONS DATA"),
      recurringResult?.error
    )
  }

  let content = children

  if (transactions && transactionsResult?.transactions) {
    content = (
      <TransactionsProvider transactions={transactionsResult.transactions}>
        {content}
      </TransactionsProvider>
    )
  }

  if (categories && categoriesResult?.customCategories) {
    content = (
      <CategoriesProvider customCategories={categoriesResult.customCategories}>
        {content}
      </CategoriesProvider>
    )
  }

  if (budgets && budgetsResult?.budgets) {
    content = (
      <BudgetsProvider budgets={budgetsResult.budgets}>
        {content}
      </BudgetsProvider>
    )
  }

  if (goals && goalsResult?.goals) {
    content = <GoalsProvider goals={goalsResult.goals}>{content}</GoalsProvider>
  }

  if (recurring && recurringResult?.recurringTransactions) {
    content = (
      <RecurringProvider
        recurringTransactions={recurringResult.recurringTransactions}
      >
        {content}
      </RecurringProvider>
    )
  }

  return <>{content}</>
}
