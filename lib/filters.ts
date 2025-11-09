import { calculateBudgetsStats, progressColorClass } from "@/lib/budgets"
import type { Budget, CustomCategory, Transaction } from "@/lib/definitions"

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
  categories: CustomCategory[],
  filters: CategoryFilters
): CustomCategory[] {
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
        if (filterProgress === "orange") {
          return budget.progressColorClass === progressColorClass.orange
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
