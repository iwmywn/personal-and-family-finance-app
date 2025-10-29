import type { Transaction, TransactionCategoryKey } from "@/lib/definitions"

interface QuickStats {
  currentMonthCount: number
  highestTransaction: Transaction | null
  lowestTransaction: Transaction | null
  avgExpense: number | null
  savingsRate: string | null
  popularCategory: TransactionCategoryKey[]
}

interface SummaryStats {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
}

interface CategoryStats {
  categoryKey: string
  count: number
  total: number
  type: "income" | "expense"
}

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
    .map(([key]) => key as TransactionCategoryKey)

  return {
    currentMonthCount,
    highestTransaction,
    lowestTransaction,
    avgExpense,
    savingsRate,
    popularCategory,
  }
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

export function calculateCategoryStats(
  transactions: Transaction[]
): CategoryStats[] {
  const stats = new Map<
    string,
    { count: number; total: number; type: "income" | "expense" }
  >()

  transactions.forEach((transaction) => {
    const categoryKey = transaction.categoryKey
    const current = stats.get(categoryKey) || {
      count: 0,
      total: 0,
      type: transaction.type,
    }
    stats.set(categoryKey, {
      count: current.count + 1,
      total: current.total + transaction.amount,
      type: transaction.type,
    })
  })

  return Array.from(stats.entries())
    .map(([categoryKey, data]) => ({
      categoryKey,
      count: data.count,
      total: data.total,
      type: data.type,
    }))
    .sort((a, b) => b.total - a.total)
}
