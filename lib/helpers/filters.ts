import type { CustomCategory, Transaction } from "@/lib/definitions"

export interface TransactionFilters {
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

export interface CategoryFilters {
  searchTerm?: string
  filterType?: string
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

  return transactions.filter((transaction) => {
    const matchesSearch = searchTerm
      ? transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const transactionDate = new Date(transaction.date)
    const transactionDateOnly = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate()
    )

    const matchesSelectedDate = selectedDate
      ? transactionDate.getDate() === selectedDate.getDate() &&
        transactionDate.getMonth() === selectedDate.getMonth() &&
        transactionDate.getFullYear() === selectedDate.getFullYear()
      : true

    const matchesDateRange =
      (!dateRange.from || transactionDateOnly >= dateRange.from) &&
      (!dateRange.to || transactionDateOnly <= dateRange.to)

    const matchesMonth =
      filterMonth === "all" ||
      transactionDate.getMonth() + 1 === parseInt(filterMonth)

    const matchesYear =
      filterYear === "all" ||
      transactionDate.getFullYear() === parseInt(filterYear)

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

  return categories.filter((category) => {
    const matchesType = filterType === "all" || category.type === filterType

    const matchesSearch = category.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    return matchesType && matchesSearch
  })
}
