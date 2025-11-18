import type {
  Budget,
  Category,
  Goal,
  RecurringTransaction,
  Transaction,
} from "@/lib/definitions"
import { calculateBudgetsStats, calculateGoalsStats } from "@/lib/statistics"
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

    return matchesDateRange && matchesMonth && matchesYear && matchesCategory
  })

  if (filterStatus !== "all" || filterProgress !== "all") {
    const budgetsWithStats = calculateBudgetsStats(
      filteredBudgets,
      transactions
    )

    filteredBudgets = budgetsWithStats
      .filter((budget) => {
        const matchesStatus =
          filterStatus === "all" || budget.status === filterStatus

        let matchesProgress = true
        if (filterProgress === "gray") {
          matchesProgress =
            budget.progressColorClass === progressColorClass.gray
        }
        if (filterProgress === "green") {
          matchesProgress =
            budget.progressColorClass === progressColorClass.green
        }
        if (filterProgress === "yellow") {
          matchesProgress =
            budget.progressColorClass === progressColorClass.yellow
        }
        if (filterProgress === "red") {
          matchesProgress = budget.progressColorClass === progressColorClass.red
        }

        return matchesStatus && matchesProgress
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
        if (filterProgress === "gray") {
          matchesProgress = goal.progressColorClass === progressColorClass.gray
        } else if (filterProgress === "green") {
          matchesProgress = goal.progressColorClass === progressColorClass.green
        } else if (filterProgress === "yellow") {
          matchesProgress =
            goal.progressColorClass === progressColorClass.yellow
        } else if (filterProgress === "red") {
          matchesProgress = goal.progressColorClass === progressColorClass.red
        }

        return matchesStatus && matchesProgress
      })
      .map((goal) => goal)
  }

  return filteredGoals
}

export function filterRecurringTransactions(
  recurringTransactions: RecurringTransaction[],
  filters: Filters
): RecurringTransaction[] {
  const {
    searchTerm = "",
    dateRange = {},
    filterMonth = "all",
    filterYear = "all",
    filterType = "all",
    filterCategoryKey = "all",
    filterStatus = "all",
  } = filters

  const normalizedSearchTerm = searchTerm.trim()
  const parsedMonth = filterMonth === "all" ? null : parseInt(filterMonth)
  const parsedYear = filterYear === "all" ? null : parseInt(filterYear)

  return recurringTransactions.filter((recurring) => {
    const matchesSearch = includesCaseInsensitive(
      recurring.description,
      normalizedSearchTerm
    )

    const startDateOnly = toDateOnly(new Date(recurring.startDate))
    const endDateOnly = recurring.endDate
      ? toDateOnly(new Date(recurring.endDate))
      : null

    const matchesDateRange =
      (!dateRange.from ||
        (endDateOnly
          ? endDateOnly.getTime() >= toDateOnly(dateRange.from).getTime()
          : true)) &&
      (!dateRange.to ||
        startDateOnly.getTime() <= toDateOnly(dateRange.to).getTime())

    const matchesMonth = !parsedMonth
      ? true
      : startDateOnly.getMonth() + 1 === parsedMonth ||
        (endDateOnly && endDateOnly.getMonth() + 1 === parsedMonth) ||
        (endDateOnly &&
          startDateOnly.getMonth() + 1 < parsedMonth &&
          endDateOnly.getMonth() + 1 > parsedMonth)

    const matchesYear = !parsedYear
      ? true
      : startDateOnly.getFullYear() === parsedYear ||
        (endDateOnly && endDateOnly.getFullYear() === parsedYear) ||
        (endDateOnly &&
          startDateOnly.getFullYear() < parsedYear &&
          endDateOnly.getFullYear() > parsedYear)

    const matchesType = filterType === "all" || recurring.type === filterType

    const matchesCategory =
      filterCategoryKey === "all" || recurring.categoryKey === filterCategoryKey

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && recurring.isActive) ||
      (filterStatus === "inactive" && !recurring.isActive)

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesMonth &&
      matchesYear &&
      matchesType &&
      matchesCategory &&
      matchesStatus
    )
  })
}
