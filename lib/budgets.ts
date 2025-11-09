import type { Budget, Transaction } from "@/lib/definitions"

interface BudgetWithStats extends Budget {
  spent: number
  percentage: number
  progressColorClass: string
  status: "expired" | "active" | "upcoming"
}

export const progressColorClass = {
  gray: "[&>[data-slot=progress-indicator]]:bg-gray-400",
  green: "[&>[data-slot=progress-indicator]]:bg-green-500",
  orange: "[&>[data-slot=progress-indicator]]:bg-orange-500",
  red: "[&>[data-slot=progress-indicator]]:bg-red-500",
} as const

export function calculateBudgetStats(
  budget: Budget,
  transactions: Transaction[]
): BudgetWithStats {
  const startDate = new Date(budget.startDate)
  const endDate = new Date(budget.endDate)
  const now = new Date()

  const budgetTransactions = transactions.filter((t) => {
    if (t.type !== "expense") return false

    const transactionDate = new Date(t.date)
    if (transactionDate < startDate || transactionDate > endDate) {
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
      colorClass = progressColorClass.orange
    } else {
      colorClass = progressColorClass.red
    }
  }

  let status: "expired" | "active" | "upcoming"
  if (endDate < now) {
    status = "expired"
  } else if (startDate <= now && endDate >= now) {
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
