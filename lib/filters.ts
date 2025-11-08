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
  searchTerm?: string
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
  getCategoryLabel: (categoryKey: string) => string
): Budget[] {
  const { searchTerm = "", filterStatus = "all" } = filters
  const normalizedSearchTerm = searchTerm.trim()
  const now = new Date()

  return budgets.filter((budget) => {
    const categoryLabel = getCategoryLabel(budget.categoryKey)
    const matchesSearch = includesCaseInsensitive(
      categoryLabel,
      normalizedSearchTerm
    )

    const isActive =
      new Date(budget.startDate) <= now && new Date(budget.endDate) >= now
    const isCompleted = new Date(budget.endDate) < now

    let matchesStatus = true
    if (filterStatus === "active") {
      matchesStatus = isActive
    } else if (filterStatus === "completed") {
      matchesStatus = isCompleted
    }

    return matchesSearch && matchesStatus
  })
}
