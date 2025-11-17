import { calculateBudgetsStats } from "@/lib/budgets"
import type { Budget, Category, Goal, Transaction } from "@/lib/definitions"
import { calculateGoalsStats } from "@/lib/goals"
import { progressColorClass } from "@/lib/utils"

interface Filters {
  searchTerm?: string
  selectedDate?: Date | null
  dateRange?: {
    from?: Date | null
    to?: Date | null
  }
  filterMonth?: string
  filterYear?: string
  filterType?: string
  filterCategoryKey?: string
  filterProgress?: string
  filterStatus?: string
}

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function includesCaseInsensitive(text: string, query: string): boolean {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

export function filterTransactions(
  transactions: Transaction[],
  filters: Filters
): Transaction[] {
  const {
    searchTerm = "",
    selectedDate,
    dateRange = {},
    filterMonth = "all",
    filterYear = "all",
    filterType = "all",
    filterCategoryKey = "all",
  } = filters

  const normalizedSearchTerm = searchTerm.trim()
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  return transactions.filter((transaction) => {
    const matchesSearch = includesCaseInsensitive(
      transaction.description,
      normalizedSearchTerm
    )

    const transactionDateOnly = toDateOnly(new Date(transaction.date))

    const matchesSelectedDate = selectedDate
      ? transactionDateOnly.getTime() === toDateOnly(selectedDate).getTime()
      : true

    const matchesDateRange =
      (!dateRange.from ||
        transactionDateOnly.getTime() >=
          toDateOnly(dateRange.from).getTime()) &&
      (!dateRange.to ||
        transactionDateOnly.getTime() <= toDateOnly(dateRange.to).getTime())

    const matchesMonth =
      !parsedMonth || transactionDateOnly.getMonth() + 1 === parsedMonth

    const matchesYear =
      !parsedYear || transactionDateOnly.getFullYear() === parsedYear

    const matchesType = filterType === "all" || transaction.type === filterType

    const matchesCategory =
      filterCategoryKey === "all" ||
      transaction.categoryKey === filterCategoryKey

    return (
      matchesSearch &&
      matchesSelectedDate &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesType &&
      matchesCategory
    )
  })
}

export function filterCustomCategories(
  categories: Category[],
  filters: Filters
): Category[] {
  const { searchTerm = "", filterType = "all" } = filters
  const normalizedSearchTerm = searchTerm.trim()

  return categories.filter((category) => {
    const matchesType = filterType === "all" || category.type === filterType

    const matchesSearch = includesCaseInsensitive(
      category.label,
      normalizedSearchTerm
    )

    return matchesType && matchesSearch
  })
}

export function filterBudgets(
  budgets: Budget[],
  filters: Filters,
  transactions: Transaction[]
): Budget[] {
  const {
    dateRange = {},
    filterMonth = "all",
    filterYear = "all",
    filterCategoryKey = "all",
    filterProgress = "all",
    filterStatus = "all",
  } = filters

  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)
  const nowDateOnly = toDateOnly(new Date())

  let filteredBudgets = budgets.filter((budget) => {
    const budgetStartDateOnly = toDateOnly(new Date(budget.startDate))
    const budgetEndDateOnly = toDateOnly(new Date(budget.endDate))

    const matchesDateRange =
      (!dateRange.from ||
        budgetEndDateOnly.getTime() >= toDateOnly(dateRange.from).getTime()) &&
      (!dateRange.to ||
        budgetStartDateOnly.getTime() <= toDateOnly(dateRange.to).getTime())

    const matchesMonth = !parsedMonth
      ? true
      : budgetStartDateOnly.getMonth() + 1 === parsedMonth ||
        budgetEndDateOnly.getMonth() + 1 === parsedMonth ||
        (budgetStartDateOnly.getMonth() + 1 < parsedMonth &&
          budgetEndDateOnly.getMonth() + 1 > parsedMonth)

    const matchesYear = !parsedYear
      ? true
      : budgetStartDateOnly.getFullYear() === parsedYear ||
        budgetEndDateOnly.getFullYear() === parsedYear ||
        (budgetStartDateOnly.getFullYear() < parsedYear &&
          budgetEndDateOnly.getFullYear() > parsedYear)

    const matchesCategory =
      filterCategoryKey === "all" || budget.categoryKey === filterCategoryKey

    let matchesStatus = true
    if (filterStatus !== "all") {
      if (filterStatus === "expired") {
        matchesStatus = budgetEndDateOnly.getTime() < nowDateOnly.getTime()
      } else if (filterStatus === "active") {
        matchesStatus =
          budgetStartDateOnly.getTime() <= nowDateOnly.getTime() &&
          budgetEndDateOnly.getTime() >= nowDateOnly.getTime()
      } else if (filterStatus === "upcoming") {
        matchesStatus = budgetStartDateOnly.getTime() > nowDateOnly.getTime()
      }
    }

    return (
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesCategory &&
      matchesStatus
    )
  })

  if (filterProgress !== "all" && transactions) {
    const budgetsWithStats = calculateBudgetsStats(
      filteredBudgets,
      transactions
    )

    filteredBudgets = budgetsWithStats
      .filter((budget) => {
        if (filterProgress === "gray") {
          return budget.progressColorClass === progressColorClass.gray
        }
        if (filterProgress === "green") {
          return budget.progressColorClass === progressColorClass.green
        }
        if (filterProgress === "yellow") {
          return budget.progressColorClass === progressColorClass.yellow
        }
        if (filterProgress === "red") {
          return budget.progressColorClass === progressColorClass.red
        }
        return true
      })
      .map((budget) => budget)
  }

  return filteredBudgets
}

export function filterGoals(
  goals: Goal[],
  filters: Filters,
  transactions: Transaction[]
): Goal[] {
  const {
    searchTerm = "",
    dateRange = {},
    filterMonth = "all",
    filterYear = "all",
    filterStatus = "all",
    filterProgress = "all",
    filterCategoryKey = "all",
  } = filters

  const normalizedSearchTerm = searchTerm.trim()
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  let filteredGoals = goals.filter((goal) => {
    const goalStartDateOnly = toDateOnly(new Date(goal.startDate))
    const goalEndDateOnly = toDateOnly(new Date(goal.endDate))

    const matchesSearch = includesCaseInsensitive(
      goal.name,
      normalizedSearchTerm
    )

    const matchesDateRange =
      (!dateRange.from ||
        goalEndDateOnly.getTime() >= toDateOnly(dateRange.from).getTime()) &&
      (!dateRange.to ||
        goalStartDateOnly.getTime() <= toDateOnly(dateRange.to).getTime())

    const matchesMonth = !parsedMonth
      ? true
      : goalStartDateOnly.getMonth() + 1 === parsedMonth ||
        goalEndDateOnly.getMonth() + 1 === parsedMonth ||
        (goalStartDateOnly.getMonth() + 1 < parsedMonth &&
          goalEndDateOnly.getMonth() + 1 > parsedMonth)

    const matchesYear = !parsedYear
      ? true
      : goalStartDateOnly.getFullYear() === parsedYear ||
        goalEndDateOnly.getFullYear() === parsedYear ||
        (goalStartDateOnly.getFullYear() < parsedYear &&
          goalEndDateOnly.getFullYear() > parsedYear)

    const matchesCategory =
      filterCategoryKey === "all" || goal.categoryKey === filterCategoryKey

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesCategory
    )
  })

  if (filterStatus !== "all" || filterProgress !== "all") {
    const goalsWithStats = calculateGoalsStats(filteredGoals, transactions)

    filteredGoals = goalsWithStats
      .filter((goal) => {
        const matchesStatus =
          filterStatus === "all" || goal.status === filterStatus

        let matchesProgress = true
        if (filterProgress !== "all") {
          if (filterProgress === "gray") {
            matchesProgress =
              goal.progressColorClass === progressColorClass.gray
          } else if (filterProgress === "green") {
            matchesProgress =
              goal.progressColorClass === progressColorClass.green
          } else if (filterProgress === "yellow") {
            matchesProgress =
              goal.progressColorClass === progressColorClass.yellow
          } else if (filterProgress === "red") {
            matchesProgress = goal.progressColorClass === progressColorClass.red
          }
        }

        return matchesStatus && matchesProgress
      })
      .map((goal) => goal)
  }

  return filteredGoals
}
