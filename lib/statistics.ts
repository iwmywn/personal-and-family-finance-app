import type { CategoryKeyType } from "@/lib/categories"
import type { Budget, Goal, Transaction } from "@/lib/definitions"
import { toDateOnly } from "@/lib/filters"
import { progressColorClass } from "@/lib/utils"

export function getCurrentMonthTransactions(
  transactions: Transaction[]
): Transaction[] {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return transactions.filter((t) => {
    const date = new Date(t.date)
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    )
  })
}

interface QuickStats {
  currentMonthCount: number
  highestTransaction: Transaction | null
  lowestTransaction: Transaction | null
  avgExpense: number | null
  savingsRate: string | null
  popularCategory: CategoryKeyType[]
}

export function calculateQuickStats(transactions: Transaction[]): QuickStats {
  const currentMonthTransactions = getCurrentMonthTransactions(transactions)

  const currentMonthCount = currentMonthTransactions.length

  if (currentMonthCount === 0) {
    return {
      currentMonthCount: 0,
      highestTransaction: null,
      lowestTransaction: null,
      avgExpense: null,
      savingsRate: null,
      popularCategory: [],
    }
  }

  let highestTransaction = currentMonthTransactions[0]
  let lowestTransaction = currentMonthTransactions[0]
  let totalIncome = 0
  let totalExpense = 0
  let expenseCount = 0
  const categorySums: Record<string, number> = {}

  for (const t of currentMonthTransactions) {
    if (t.amount > highestTransaction.amount) highestTransaction = t
    if (t.amount < lowestTransaction.amount) lowestTransaction = t

    if (t.type === "income") {
      totalIncome += t.amount
    } else if (t.type === "expense") {
      totalExpense += t.amount
      expenseCount++
    }

    categorySums[t.categoryKey] = (categorySums[t.categoryKey] || 0) + t.amount
  }

  const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : null

  const savingsRate =
    totalIncome > 0
      ? Number(
          (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
        ).toLocaleString("fullwide", {
          useGrouping: false,
        })
      : null

  const maxTotal = Math.max(...Object.values(categorySums))
  const popularCategory = Object.entries(categorySums)
    .filter(([, total]) => total === maxTotal)
    .map(([key]) => key as CategoryKeyType)

  return {
    currentMonthCount,
    highestTransaction,
    lowestTransaction,
    avgExpense,
    savingsRate,
    popularCategory,
  }
}

interface SummaryStats {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
}

export function calculateSummaryStats(
  transactions: Transaction[]
): SummaryStats {
  const incomeTransactions = transactions.filter((t) => t.type === "income")
  const expenseTransactions = transactions.filter((t) => t.type === "expense")

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense
  const transactionCount = transactions.length
  const incomeCount = incomeTransactions.length
  const expenseCount = expenseTransactions.length

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    incomeCount,
    expenseCount,
  }
}

interface CategoryStats {
  categoryKey: string
  count: number
  total: number
  type: "income" | "expense"
}

export function calculateCategoriesStats(
  transactions: Transaction[]
): CategoryStats[] {
  const categories = Array.from(new Set(transactions.map((t) => t.categoryKey)))

  return categories
    .map((categoryKey) => {
      const filtered = transactions.filter((t) => t.categoryKey === categoryKey)
      const total = filtered.reduce((sum, t) => sum + t.amount, 0)
      return {
        categoryKey,
        count: filtered.length,
        total,
        type: filtered[0].type,
      }
    })
    .sort((a, b) => b.total - a.total)
}

interface StatBaseConfig<TBase, Transaction> {
  type: "income" | "expense"
  getTarget: (item: TBase) => number
  getCategoryKey: (item: TBase) => string
  getAmount: (t: Transaction) => number
  pickColor: (percentage: number, hasItems: boolean) => string
}

export function calculateStatsBase<TBase extends Budget | Goal>(
  base: TBase,
  transactions: Transaction[],
  config: StatBaseConfig<TBase, Transaction>
) {
  const startDateOnly = toDateOnly(new Date(base.startDate))
  const endDateOnly = toDateOnly(new Date(base.endDate))
  const nowDateOnly = toDateOnly(new Date())

  const filtered = transactions.filter((t) => {
    if (t.type !== config.type) return false

    const transactionDateOnly = toDateOnly(new Date(t.date))

    return (
      transactionDateOnly.getTime() >= startDateOnly.getTime() &&
      transactionDateOnly.getTime() <= endDateOnly.getTime() &&
      t.categoryKey === config.getCategoryKey(base)
    )
  })

  const total = filtered.reduce((sum, t) => sum + config.getAmount(t), 0)

  const target = config.getTarget(base)
  const percentage = target === 0 ? 0 : (total / target) * 100

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

  const colorClass = config.pickColor(percentage, filtered.length > 0)

  return { total, percentage, status, colorClass }
}

interface BudgetWithStats extends Budget {
  spent: number
  percentage: number
  progressColorClass: string
  status: "expired" | "active" | "upcoming"
}

export function calculateBudgetsStats(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetWithStats[] {
  return budgets.map((budget) => {
    const stats = calculateStatsBase(budget, transactions, {
      type: "expense",
      getTarget: (b) => b.allocatedAmount,
      getCategoryKey: (b) => b.categoryKey,
      getAmount: (t) => t.amount,
      pickColor: (percentage, has) => {
        if (!has) return progressColorClass.gray
        if (percentage < 75) return progressColorClass.green
        if (percentage < 100) return progressColorClass.yellow
        return progressColorClass.red
      },
    })

    return {
      ...budget,
      spent: stats.total,
      percentage: stats.percentage,
      status: stats.status,
      progressColorClass: stats.colorClass,
    }
  })
}

interface GoalWithStats extends Goal {
  accumulated: number
  percentage: number
  progressColorClass: string
  status: "expired" | "active" | "upcoming"
}

export function calculateGoalsStats(
  goals: Goal[],
  transactions: Transaction[]
): GoalWithStats[] {
  return goals.map((goal) => {
    const stats = calculateStatsBase(goal, transactions, {
      type: "income",
      getTarget: (g) => g.targetAmount,
      getCategoryKey: (g) => g.categoryKey,
      getAmount: (t) => t.amount,
      pickColor: (percentage, has) => {
        if (!has) return progressColorClass.gray
        if (percentage >= 100) return progressColorClass.green
        if (percentage >= 75) return progressColorClass.yellow
        return progressColorClass.red
      },
    })

    return {
      ...goal,
      accumulated: stats.total,
      percentage: stats.percentage,
      status: stats.status,
      progressColorClass: stats.colorClass,
    }
  })
}
