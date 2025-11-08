import { calculateBudgetsStats } from "@/lib/budgets"
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
  selectedDate?: Date | null
  dateRange?: {
    from?: Date | null
    to?: Date | null
  }
  filterMonth?: string
  filterYear?: string
  filterCategoryKey?: string
  filterProgress?: string
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
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  return transactions.filter((transaction) => {
    const matchesSearch = includesCaseInsensitive(
      transaction.description,
      normalizedSearchTerm
    )

    const transactionDate = new Date(transaction.date)
    const transactionDateOnly = toDateOnly(transactionDate)!

    const matchesSelectedDate = selectedDate
      ? transactionDate.getDate() === selectedDate.getDate() &&
        transactionDate.getMonth() === selectedDate.getMonth() &&
        transactionDate.getFullYear() === selectedDate.getFullYear()
      : true

    const matchesDateRange =
      (!fromDateOnly || transactionDateOnly >= fromDateOnly) &&
      (!toDateOnlyValue || transactionDateOnly <= toDateOnlyValue)

    const matchesMonth =
      !parsedMonth || transactionDate.getMonth() + 1 === parsedMonth

    const matchesYear =
      !parsedYear || transactionDate.getFullYear() === parsedYear

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
  transactions?: Transaction[]
): Budget[] {
  const {
    selectedDate,
    dateRange = {},
    filterMonth = "all",
    filterYear = "all",
    filterCategoryKey = "all",
    filterProgress = "all",
  } = filters

  const fromDateOnly = toDateOnly(dateRange.from)
  const toDateOnlyValue = toDateOnly(dateRange.to)
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  let filteredBudgets = budgets.filter((budget) => {
    const budgetStartDate = new Date(budget.startDate)
    const budgetEndDate = new Date(budget.endDate)

    const matchesSelectedDate = selectedDate
      ? budgetStartDate <= selectedDate && budgetEndDate >= selectedDate
      : true

    const matchesDateRange =
      (!fromDateOnly || budgetEndDate >= fromDateOnly) &&
      (!toDateOnlyValue || budgetStartDate <= toDateOnlyValue)

    const matchesMonth = !parsedMonth
      ? true
      : budgetStartDate.getMonth() + 1 === parsedMonth ||
        budgetEndDate.getMonth() + 1 === parsedMonth ||
        (budgetStartDate.getMonth() + 1 < parsedMonth &&
          budgetEndDate.getMonth() + 1 > parsedMonth)

    const matchesYear = !parsedYear
      ? true
      : budgetStartDate.getFullYear() === parsedYear ||
        budgetEndDate.getFullYear() === parsedYear ||
        (budgetStartDate.getFullYear() < parsedYear &&
          budgetEndDate.getFullYear() > parsedYear)

    const matchesCategory =
      filterCategoryKey === "all" || budget.categoryKey === filterCategoryKey

    return (
      matchesSelectedDate &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesCategory
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
          return (
            budget.progressColorClass ===
            "[&>[data-slot=progress-indicator]]:bg-gray-400"
          )
        }
        if (filterProgress === "green") {
          return (
            budget.progressColorClass ===
            "[&>[data-slot=progress-indicator]]:bg-green-500"
          )
        }
        if (filterProgress === "orange") {
          return (
            budget.progressColorClass ===
            "[&>[data-slot=progress-indicator]]:bg-orange-500"
          )
        }
        if (filterProgress === "red") {
          return (
            budget.progressColorClass ===
            "[&>[data-slot=progress-indicator]]:bg-red-500"
          )
        }
        return true
      })
      .map((budget) => budget)
  }

  return filteredBudgets
}
