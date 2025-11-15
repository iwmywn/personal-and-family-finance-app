import { calculateBudgetsStats, progressColorClass } from "@/lib/budgets"
import type { Budget, Category, Goal, Transaction } from "@/lib/definitions"
import {
  calculateGoalsStats,
  progressColorClass as goalProgressColorClass,
} from "@/lib/goals"

interface TransactionFilters {
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
}

interface CategoryFilters {
  searchTerm?: string
  filterType?: string
}

interface BudgetFilters {
  dateRange?: {
    from?: Date | null
    to?: Date | null
  }
  filterMonth?: string
  filterYear?: string
  filterCategoryKey?: string
  filterProgress?: string
  filterStatus?: string
}

export function toDateOnly(date: Date | null | undefined): Date | null {
  if (!date) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function includesCaseInsensitive(text: string, query: string): boolean {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
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
  const fromDateOnly = toDateOnly(dateRange.from)
  const toDateOnlyValue = toDateOnly(dateRange.to)
  const selectedDateOnly = toDateOnly(selectedDate)
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  return transactions.filter((transaction) => {
    const matchesSearch = includesCaseInsensitive(
      transaction.description,
      normalizedSearchTerm
    )

    const transactionDate = new Date(transaction.date)
    const transactionDateOnly = toDateOnly(transactionDate)!

    const matchesSelectedDate = selectedDateOnly
      ? transactionDateOnly.getTime() === selectedDateOnly.getTime()
      : true

    const matchesDateRange =
      (!fromDateOnly ||
        transactionDateOnly.getTime() >= fromDateOnly.getTime()) &&
      (!toDateOnlyValue ||
        transactionDateOnly.getTime() <= toDateOnlyValue.getTime())

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
  filters: CategoryFilters
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
  filters: BudgetFilters,
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

  const fromDateOnly = toDateOnly(dateRange.from)
  const toDateOnlyValue = toDateOnly(dateRange.to)
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)
  const nowDateOnly = toDateOnly(new Date())!

  let filteredBudgets = budgets.filter((budget) => {
    const budgetStartDateOnly = toDateOnly(new Date(budget.startDate))!
    const budgetEndDateOnly = toDateOnly(new Date(budget.endDate))!

    const matchesDateRange =
      (!fromDateOnly ||
        budgetEndDateOnly.getTime() >= fromDateOnly.getTime()) &&
      (!toDateOnlyValue ||
        budgetStartDateOnly.getTime() <= toDateOnlyValue.getTime())

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

interface GoalFilters {
  searchTerm?: string
  filterStatus?: string
  filterProgress?: string
  filterCategoryKey?: string
}

export function filterGoals(goals: Goal[], filters: GoalFilters): Goal[] {
  const {
    searchTerm = "",
    filterStatus = "all",
    filterProgress = "all",
    filterCategoryKey = "all",
  } = filters

  const normalizedSearchTerm = searchTerm.trim()

  let filteredGoals = goals.filter((goal) => {
    const matchesSearch = includesCaseInsensitive(
      goal.name,
      normalizedSearchTerm
    )

    const matchesCategory =
      filterCategoryKey === "all" || goal.categoryKey === filterCategoryKey

    return matchesSearch && matchesCategory
  })

  if (filterStatus !== "all" || filterProgress !== "all") {
    const goalsWithStats = calculateGoalsStats(filteredGoals)

    filteredGoals = goalsWithStats
      .filter((goal) => {
        const matchesStatus =
          filterStatus === "all" || goal.status === filterStatus

        let matchesProgress = true
        if (filterProgress !== "all") {
          if (filterProgress === "gray") {
            matchesProgress =
              goal.progressColorClass === goalProgressColorClass.gray
          } else if (filterProgress === "green") {
            matchesProgress =
              goal.progressColorClass === goalProgressColorClass.green
          } else if (filterProgress === "yellow") {
            matchesProgress =
              goal.progressColorClass === goalProgressColorClass.yellow
          } else if (filterProgress === "red") {
            matchesProgress =
              goal.progressColorClass === goalProgressColorClass.red
          }
        }

        return matchesStatus && matchesProgress
      })
      .map((goal) => goal)
  }

  return filteredGoals
}
