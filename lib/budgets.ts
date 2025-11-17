import type { Budget, Transaction } from "@/lib/definitions"
import { toDateOnly } from "@/lib/filters"
import { progressColorClass } from "@/lib/utils"

interface BudgetWithStats extends Budget {
  spent: number
  percentage: number
  progressColorClass: string
  status: "expired" | "active" | "upcoming"
}

export function calculateBudgetStats(
  budget: Budget,
  transactions: Transaction[]
): BudgetWithStats {
  const startDateOnly = toDateOnly(new Date(budget.startDate))
  const endDateOnly = toDateOnly(new Date(budget.endDate))
  const nowDateOnly = toDateOnly(new Date())

  const budgetTransactions = transactions.filter((t) => {
    if (t.type !== "expense") return false

    const transactionDateOnly = toDateOnly(new Date(t.date))

    if (
      transactionDateOnly.getTime() < startDateOnly.getTime() ||
      transactionDateOnly.getTime() > endDateOnly.getTime()
    ) {
      return false
    }

    return t.categoryKey === budget.categoryKey
  })

  const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)

  const percentage = budget.amount === 0 ? 0 : (spent / budget.amount) * 100

  let colorClass: string = progressColorClass.gray
  if (budgetTransactions.length > 0) {
    if (percentage < 75) {
      colorClass = progressColorClass.green
    } else if (percentage < 100) {
      colorClass = progressColorClass.yellow
    } else {
      colorClass = progressColorClass.red
    }
  }

  let status: "expired" | "active" | "upcoming"
  if (endDateOnly.getTime() < nowDateOnly.getTime()) {
    status = "expired"
  } else if (
    startDateOnly.getTime() <= nowDateOnly.getTime() &&
    endDateOnly.getTime() >= nowDateOnly.getTime()
  ) {
    status = "active"
  } else {
    status = "upcoming"
  }

  return {
    ...budget,
    spent,
    percentage,
    progressColorClass: colorClass,
    status,
  }
}

export function calculateBudgetsStats(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetWithStats[] {
  return budgets.map((budget) => calculateBudgetStats(budget, transactions))
}
