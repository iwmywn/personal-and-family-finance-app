import type { Budget, Transaction } from "@/lib/definitions"

interface BudgetWithStats extends Budget {
  spent: number
  percentage: number
  progressColorClass: string
  isActive: boolean
  isCompleted: boolean
}

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

  let progressColorClass = "[&>[data-slot=progress-indicator]]:bg-gray-400"
  if (budgetTransactions.length > 0) {
    if (percentage < 75) {
      progressColorClass = "[&>[data-slot=progress-indicator]]:bg-green-500"
    } else if (percentage < 100) {
      progressColorClass = "[&>[data-slot=progress-indicator]]:bg-orange-500"
    } else {
      progressColorClass = "[&>[data-slot=progress-indicator]]:bg-red-500"
    }
  }

  const isActive = startDate <= now && endDate >= now

  const isCompleted = endDate < now

  return {
    ...budget,
    spent,
    percentage,
    progressColorClass,
    isActive,
    isCompleted,
  }
}

export function calculateBudgetsStats(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetWithStats[] {
  return budgets.map((budget) => calculateBudgetStats(budget, transactions))
}
