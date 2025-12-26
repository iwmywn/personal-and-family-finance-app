import Decimal from "decimal.js"

import type { CategoryKeyType } from "@/lib/categories"
import type { Budget, Goal, Transaction } from "@/lib/definitions"
import { normalizeToUTCDate, progressColorClass } from "@/lib/utils"

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
  avgExpense: string | null
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
  let totalIncome = new Decimal(0)
  let totalExpense = new Decimal(0)
  let expenseCount = 0
  const categorySums: Record<string, Decimal> = {}

  for (const t of currentMonthTransactions) {
    const amount = new Decimal(t.amount)

    if (amount.greaterThan(new Decimal(highestTransaction.amount))) {
      highestTransaction = t
    }
    if (amount.lessThan(new Decimal(lowestTransaction.amount))) {
      lowestTransaction = t
    }

    if (t.type === "income") {
      totalIncome = totalIncome.plus(amount)
    } else if (t.type === "expense") {
      totalExpense = totalExpense.plus(amount)
      expenseCount++
    }

    categorySums[t.categoryKey] = (
      categorySums[t.categoryKey] || new Decimal(0)
    ).plus(amount)
  }

  const avgExpense =
    expenseCount > 0 ? totalExpense.dividedBy(expenseCount).toString() : null

  const savingsRate = totalIncome.greaterThan(0)
    ? totalIncome
        .minus(totalExpense)
        .dividedBy(totalIncome)
        .mul(100)
        .toDecimalPlaces(1)
        .toFixed(0)
    : null

  const maxTotal = Object.values(categorySums).reduce(
    (max, val) => (val.greaterThan(max) ? val : max),
    new Decimal(0)
  )

  const popularCategory = Object.entries(categorySums)
    .filter(([, total]) => total.equals(maxTotal))
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
  totalIncome: string
  totalExpense: string
  balance: string
  transactionCount: number
  incomeCount: number
  expenseCount: number
}

export function calculateSummaryStats(
  transactions: Transaction[]
): SummaryStats {
  const incomeTransactions = transactions.filter((t) => t.type === "income")
  const expenseTransactions = transactions.filter((t) => t.type === "expense")

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum.plus(new Decimal(t.amount)),
    new Decimal(0)
  )
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum.plus(new Decimal(t.amount)),
    new Decimal(0)
  )
  const balance = totalIncome.minus(totalExpense)
  const transactionCount = transactions.length
  const incomeCount = incomeTransactions.length
  const expenseCount = expenseTransactions.length

  return {
    totalIncome: totalIncome.toString(),
    totalExpense: totalExpense.toString(),
    balance: balance.toString(),
    transactionCount,
    incomeCount,
    expenseCount,
  }
}

interface CategoryStats {
  categoryKey: string
  count: number
  total: string
  type: "income" | "expense"
}

export function calculateCategoriesStats(
  transactions: Transaction[]
): CategoryStats[] {
  const categories = Array.from(new Set(transactions.map((t) => t.categoryKey)))

  return categories
    .map((categoryKey) => {
      const filtered = transactions.filter((t) => t.categoryKey === categoryKey)
      const total = filtered.reduce(
        (sum, t) => sum.plus(new Decimal(t.amount)),
        new Decimal(0)
      )
      return {
        categoryKey,
        count: filtered.length,
        total: total.toString(),
        type: filtered[0].type,
      }
    })
    .sort((a, b) => {
      const aDecimal = new Decimal(a.total)
      const bDecimal = new Decimal(b.total)
      return bDecimal.greaterThan(aDecimal) ? 1 : -1
    })
}

interface StatBaseConfig<TBase, Transaction> {
  type: "income" | "expense"
  getTarget: (item: TBase) => string
  getCategoryKey: (item: TBase) => string
  getAmount: (t: Transaction) => string
  pickColor: (percentage: number, hasItems: boolean) => string
}

function calculateStatsBase<TBase extends Budget | Goal>(
  base: TBase,
  transactions: Transaction[],
  config: StatBaseConfig<TBase, Transaction>
) {
  const startDateOnly = normalizeToUTCDate(new Date(base.startDate))
  const endDateOnly = normalizeToUTCDate(new Date(base.endDate))
  const nowDateOnly = normalizeToUTCDate(new Date())

  const filtered = transactions.filter((t) => {
    if (t.type !== config.type) return false

    const transactionDateOnly = normalizeToUTCDate(new Date(t.date))

    return (
      transactionDateOnly.getTime() >= startDateOnly.getTime() &&
      transactionDateOnly.getTime() <= endDateOnly.getTime() &&
      t.categoryKey === config.getCategoryKey(base)
    )
  })

  const total = filtered.reduce(
    (sum, t) => sum.plus(new Decimal(config.getAmount(t))),
    new Decimal(0)
  )

  const target = new Decimal(config.getTarget(base))
  const percentage = target.equals(0)
    ? 0
    : total.div(target).mul(100).toNumber()

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

  return { total: total.toString(), percentage, status, colorClass }
}

interface BudgetWithStats extends Budget {
  spent: string
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
  accumulated: string
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
