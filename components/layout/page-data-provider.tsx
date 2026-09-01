import { getExtracted } from "next-intl/server"

import { getBudgets } from "@/actions/budget.actions"
import { getCustomCategories } from "@/actions/category.actions"
import { getGoals } from "@/actions/goal.actions"
import { getRecurringTransactions } from "@/actions/recurring.actions"
import { getTransactions } from "@/actions/transaction.actions"
import { ErrorEmptyState } from "@/components/layout/error-empty-state"
import { BudgetsProvider } from "@/context/budgets-context"
import { CategoriesProvider } from "@/context/categories-context"
import { GoalsProvider } from "@/context/goals-context"
import { RecurringProvider } from "@/context/recurring-context"
import { TransactionsProvider } from "@/context/transactions-context"

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
  const t = await getExtracted()

  const [
    transactionsResult,
    categoriesResult,
    budgetsResult,
    goalsResult,
    recurringResult,
  ] = await Promise.all([
    transactions ? getTransactions() : Promise.resolve(null),
    categories ? getCustomCategories() : Promise.resolve(null),
    budgets ? getBudgets() : Promise.resolve(null),
    goals ? getGoals() : Promise.resolve(null),
    recurring ? getRecurringTransactions() : Promise.resolve(null),
  ])

  if (transactions && !transactionsResult?.transactions) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH TRANSACTIONS DATA")}
        description={transactionsResult?.error}
      />
    )
  }

  if (categories && !categoriesResult?.customCategories) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH CATEGORIES DATA")}
        description={categoriesResult?.error}
      />
    )
  }

  if (budgets && !budgetsResult?.budgets) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH BUDGETS DATA")}
        description={budgetsResult?.error}
      />
    )
  }

  if (goals && !goalsResult?.goals) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH GOALS DATA")}
        description={goalsResult?.error}
      />
    )
  }

  if (recurring && !recurringResult?.recurringTransactions) {
    return (
      <ErrorEmptyState
        title={t("CANNOT FETCH RECURRING TRANSACTIONS DATA")}
        description={recurringResult?.error}
      />
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
