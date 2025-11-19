import {
  mockBudgets,
  mockCustomCategories,
  mockGoals,
  mockRecurringTransactions,
  mockTransactions,
} from "@/tests/shared/data"
import {
  filterBudgets,
  filterCustomCategories,
  filterGoals,
  filterRecurringTransactions,
  filterTransactions,
  includesCaseInsensitive,
} from "@/lib/filters"

describe("Filters", () => {
  describe("includesCaseInsensitive", () => {
    it("should return true when query is empty", () => {
      expect(includesCaseInsensitive("Hello World", "")).toBe(true)
    })

    it("should match case-insensitively", () => {
      expect(includesCaseInsensitive("Restaurant", "restaurant")).toBe(true)
      expect(includesCaseInsensitive("Restaurant", "RESTAURANT")).toBe(true)
    })

    it("should match partial substrings", () => {
      expect(includesCaseInsensitive("Freelance Work", "lance")).toBe(true)
    })

    it("should return false when no match", () => {
      expect(includesCaseInsensitive("Taxi", "bus")).toBe(false)
    })
  })

  describe("filterTransactions", () => {
    it("should filter by search term", () => {
      const result = filterTransactions(mockTransactions, {
        searchTerm: "salary",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Salary")
    })

    it("should filter by transaction type", () => {
      const result = filterTransactions(mockTransactions, {
        filterType: "income",
      })

      expect(result).toHaveLength(2)
      expect(result.every((t) => t.type === "income")).toBe(true)
    })

    it("should filter by category key", () => {
      const result = filterTransactions(mockTransactions, {
        filterCategoryKey: "food_beverage",
      })

      expect(result).toHaveLength(2)
      expect(result[0].categoryKey).toBe("food_beverage")
    })

    it("should filter by month", () => {
      const result = filterTransactions(mockTransactions, {
        filterMonth: "1",
      })

      expect(result).toHaveLength(5)
      expect(result.every((t) => new Date(t.date).getMonth() === 0)).toBe(true)
      expect(result.map((t) => t._id)).toEqual(["1", "2", "3", "4", "5"])
    })

    it("should filter by year", () => {
      const result = filterTransactions(mockTransactions, {
        filterYear: "2024",
      })

      expect(result).toHaveLength(7)
      expect(result.every((t) => new Date(t.date).getFullYear() === 2024)).toBe(
        true
      )
    })

    it("should filter by selected date", () => {
      const selectedDate = new Date("2024-01-20")
      const result = filterTransactions(mockTransactions, {
        selectedDate,
      })

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("3")
    })

    it("should filter by date range", () => {
      const result = filterTransactions(mockTransactions, {
        dateRange: {
          from: new Date("2024-01-20"),
          to: new Date("2024-01-25"),
        },
      })

      expect(result).toHaveLength(3)
      expect(result.map((t) => t._id)).toEqual(["3", "4", "5"])
    })

    it("should combine multiple filters", () => {
      const result = filterTransactions(mockTransactions, {
        searchTerm: "freelance",
        filterType: "income",
        filterYear: "2024",
      })

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("3")
    })

    it("should return all transactions when no filters applied", () => {
      const result = filterTransactions(mockTransactions, {})

      expect(result).toHaveLength(8)
    })

    it("should handle empty transactions array", () => {
      const result = filterTransactions([], {
        searchTerm: "test",
      })

      expect(result).toEqual([])
    })

    it("should handle case insensitive search", () => {
      const result = filterTransactions(mockTransactions, {
        searchTerm: "SALARY",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Salary")
    })

    it("should handle partial search matches", () => {
      const result = filterTransactions(mockTransactions, {
        searchTerm: "freel",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Freelance")
    })

    it("should handle date range with only from date", () => {
      const result = filterTransactions(mockTransactions, {
        dateRange: {
          from: new Date("2024-01-20"),
        },
      })

      expect(result).toHaveLength(6)
      expect(result.map((t) => t._id)).toEqual(["3", "4", "5", "6", "7", "8"])
    })

    it("should handle date range with only to date", () => {
      const result = filterTransactions(mockTransactions, {
        dateRange: {
          to: new Date("2024-01-20"),
        },
      })

      expect(result).toHaveLength(3)
      expect(result.map((t) => t._id)).toEqual(["1", "2", "3"])
    })
  })

  describe("filterCustomCategories", () => {
    it("should filter by search term", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        searchTerm: "freelance",
      })

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe("Freelance Work")
    })

    it("should filter by type", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        filterType: "expense",
      })

      expect(result).toHaveLength(2)
      expect(result.every((c) => c.type === "expense")).toBe(true)
    })

    it("should combine search and type filters", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        searchTerm: "restaurant",
        filterType: "expense",
      })

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe("Restaurant")
    })

    it("should return all categories when no filters applied", () => {
      const result = filterCustomCategories(mockCustomCategories, {})

      expect(result).toHaveLength(3)
    })

    it("should handle empty categories array", () => {
      const result = filterCustomCategories([], {
        searchTerm: "test",
      })

      expect(result).toEqual([])
    })

    it("should handle case insensitive search", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        searchTerm: "RESTAURANT",
      })

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe("Restaurant")
    })

    it("should handle partial search matches", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        searchTerm: "tax",
      })

      expect(result).toHaveLength(1)
      expect(result[0].label).toBe("Taxi")
    })

    it("should return empty array when no matches found", () => {
      const result = filterCustomCategories(mockCustomCategories, {
        searchTerm: "nonexistent",
      })

      expect(result).toEqual([])
    })
  })

  describe("filterBudgets", () => {
    it("should filter by category key", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterCategoryKey: "food_beverage",
        },
        mockTransactions
      )

      expect(result).toHaveLength(2)
      expect(result.every((b) => b.categoryKey === "food_beverage")).toBe(true)
    })

    it("should filter by status - expired", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-04-01"))

      const result = filterBudgets(
        mockBudgets,
        {
          filterStatus: "expired",
        },
        mockTransactions
      )

      // Should return budgets where endDate < now
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const endDate = new Date(budget.endDate)
        expect(endDate < new Date()).toBe(true)
      })

      vi.useRealTimers()
    })

    it("should filter by status - active", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-03-15"))

      const result = filterBudgets(
        mockBudgets,
        {
          filterStatus: "active",
        },
        mockTransactions
      )

      // Should return budgets where startDate <= now && endDate >= now
      expect(result.length).toBeGreaterThan(0)
      const now = new Date()
      result.forEach((budget) => {
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate)
        expect(startDate <= now && endDate >= now).toBe(true)
      })

      vi.useRealTimers()
    })

    it("should filter by status - upcoming", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-01-15"))

      const result = filterBudgets(
        mockBudgets,
        {
          filterStatus: "upcoming",
        },
        mockTransactions
      )

      // Should return budgets where startDate > now
      expect(result.length).toBeGreaterThan(0)
      const now = new Date()
      result.forEach((budget) => {
        const startDate = new Date(budget.startDate)
        expect(startDate > now).toBe(true)
      })

      vi.useRealTimers()
    })

    it("should return all budgets when filterStatus is 'all'", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterStatus: "all",
        },
        mockTransactions
      )

      expect(result).toHaveLength(mockBudgets.length)
    })

    it("should filter by date range", () => {
      const fromDate = new Date("2024-03-01")
      const toDate = new Date("2024-03-28")
      const result = filterBudgets(
        mockBudgets,
        {
          dateRange: {
            from: fromDate,
            to: toDate,
          },
        },
        mockTransactions
      )

      // Should return budgets that overlap with date range
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = new Date(budget.endDate)
        expect(budgetEnd >= fromDate && budgetStart <= toDate).toBe(true)
      })
    })

    it("should filter by month", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterMonth: "3", // March 2024
        },
        mockTransactions
      )

      // Should return budgets that overlap with the selected month
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = new Date(budget.endDate)
        const startMonth = budgetStart.getMonth() + 1
        const endMonth = budgetEnd.getMonth() + 1
        expect(
          startMonth === 3 || endMonth === 3 || (startMonth < 3 && endMonth > 3)
        ).toBe(true)
      })
    })

    it("should filter by year", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterYear: "2024",
        },
        mockTransactions
      )

      // Should return budgets that overlap with the selected year
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = new Date(budget.endDate)
        const startYear = budgetStart.getFullYear()
        const endYear = budgetEnd.getFullYear()
        expect(
          startYear === 2024 ||
            endYear === 2024 ||
            (startYear < 2024 && endYear > 2024)
        ).toBe(true)
      })
    })

    it("should filter by progress - gray (no transactions)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "gray",
        },
        mockTransactions
      )

      // Should return budgets with no transactions (gray progress)
      result.forEach((budget) => {
        const budgetTransactions = mockTransactions.filter(
          (t) =>
            t.type === "expense" &&
            t.categoryKey === budget.categoryKey &&
            new Date(t.date) >= new Date(budget.startDate) &&
            new Date(t.date) <= new Date(budget.endDate)
        )
        expect(budgetTransactions.length).toBe(0)
      })
    })

    it("should filter by progress - green (< 75%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "green",
        },
        mockTransactions
      )

      // Should return budgets with green progress (< 75%)
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetTransactions = mockTransactions.filter(
          (t) =>
            t.type === "expense" &&
            t.categoryKey === budget.categoryKey &&
            new Date(t.date) >= new Date(budget.startDate) &&
            new Date(t.date) <= new Date(budget.endDate)
        )
        const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)
        const percentage =
          budget.allocatedAmount === 0
            ? 0
            : (spent / budget.allocatedAmount) * 100
        expect(percentage < 75).toBe(true)
      })
    })

    it("should filter by progress - yellow (75-100%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "yellow",
        },
        mockTransactions
      )

      // Should return budgets with yellow progress (75-100%)
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetTransactions = mockTransactions.filter(
          (t) =>
            t.type === "expense" &&
            t.categoryKey === budget.categoryKey &&
            new Date(t.date) >= new Date(budget.startDate) &&
            new Date(t.date) <= new Date(budget.endDate)
        )
        const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)
        const percentage =
          budget.allocatedAmount === 0
            ? 0
            : (spent / budget.allocatedAmount) * 100
        expect(percentage >= 75 && percentage < 100).toBe(true)
      })
    })

    it("should filter by progress - red (>= 100%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "red",
        },
        mockTransactions
      )

      // Should return budgets with red progress (>= 100%)
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetTransactions = mockTransactions.filter(
          (t) =>
            t.type === "expense" &&
            t.categoryKey === budget.categoryKey &&
            new Date(t.date) >= new Date(budget.startDate) &&
            new Date(t.date) <= new Date(budget.endDate)
        )
        const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)
        const percentage =
          budget.allocatedAmount === 0
            ? 0
            : (spent / budget.allocatedAmount) * 100
        expect(percentage >= 100).toBe(true)
      })
    })

    it("should return all budgets when filterProgress is 'all'", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "all",
        },
        mockTransactions
      )

      expect(result).toHaveLength(mockBudgets.length)
    })

    it("should combine multiple filters", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterCategoryKey: "food_beverage",
          filterMonth: "3",
        },
        mockTransactions
      )

      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        expect(budget.categoryKey).toBe("food_beverage")
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = new Date(budget.endDate)
        const startMonth = budgetStart.getMonth() + 1
        const endMonth = budgetEnd.getMonth() + 1
        expect(
          startMonth === 3 || endMonth === 3 || (startMonth < 3 && endMonth > 3)
        ).toBe(true)
      })
    })

    it("should return all budgets when no filters applied", () => {
      const result = filterBudgets(mockBudgets, {}, mockTransactions)

      expect(result).toHaveLength(mockBudgets.length)
    })

    it("should handle empty budgets array", () => {
      const result = filterBudgets(
        [],
        {
          filterCategoryKey: "food_beverage",
        },
        mockTransactions
      )

      expect(result).toEqual([])
    })

    it("should handle date range with only from date", () => {
      const fromDate = new Date("2024-03-01")
      const result = filterBudgets(
        mockBudgets,
        {
          dateRange: {
            from: fromDate,
          },
        },
        mockTransactions
      )

      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetEnd = new Date(budget.endDate)
        expect(budgetEnd >= fromDate).toBe(true)
      })
    })

    it("should handle date range with only to date", () => {
      const toDate = new Date("2024-03-28")
      const result = filterBudgets(
        mockBudgets,
        {
          dateRange: {
            to: toDate,
          },
        },
        mockTransactions
      )

      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        const budgetStart = new Date(budget.startDate)
        expect(budgetStart <= toDate).toBe(true)
      })
    })

    it("should return empty array when no matches found", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterCategoryKey: "nonexistent_category",
        },
        mockTransactions
      )

      expect(result).toEqual([])
    })
  })

  describe("filterGoals", () => {
    it("should filter by search term", () => {
      const result = filterGoals(
        mockGoals,
        {
          searchTerm: "motorbike",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe("buy a motorbike")
    })

    it("should filter by category key", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterCategoryKey: "business_freelance",
        },
        mockTransactions
      )

      expect(result).toHaveLength(3)
      expect(
        result.every((goal) => goal.categoryKey === "business_freelance")
      ).toBe(true)
    })

    it("should filter by date range", () => {
      const fromDate = new Date("2024-01-01")
      const toDate = new Date("2024-01-31")
      const result = filterGoals(
        mockGoals,
        {
          dateRange: {
            from: fromDate,
            to: toDate,
          },
        },
        mockTransactions
      )

      expect(result.map((goal) => goal._id)).toEqual(["1", "2", "3", "4"])
      result.forEach((goal) => {
        const start = new Date(goal.startDate)
        const end = new Date(goal.endDate)
        expect(end >= fromDate && start <= toDate).toBe(true)
      })
    })

    it("should filter by month", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterMonth: "1",
        },
        mockTransactions
      )

      expect(result.map((goal) => goal._id)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
      ])
    })

    it("should filter by year", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterYear: "2023",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("5")
    })

    it("should filter by status - expired", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-04-15"))

      const result = filterGoals(
        mockGoals,
        {
          filterStatus: "expired",
        },
        mockTransactions
      )

      const now = new Date()
      expect(result.map((goal) => goal._id)).toEqual(["3", "4", "5"])
      result.forEach((goal) => {
        const endDate = new Date(goal.endDate)
        expect(endDate < now).toBe(true)
      })

      vi.useRealTimers()
    })

    it("should filter by status - active", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-01-15"))

      const result = filterGoals(
        mockGoals,
        {
          filterStatus: "active",
        },
        mockTransactions
      )

      const now = new Date()
      expect(result.map((goal) => goal._id)).toEqual(["1", "2", "3", "4"])
      result.forEach((goal) => {
        const startDate = new Date(goal.startDate)
        const endDate = new Date(goal.endDate)
        expect(startDate <= now && endDate >= now).toBe(true)
      })

      vi.useRealTimers()
    })

    it("should filter by status - upcoming", () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-05-01"))

      const result = filterGoals(
        mockGoals,
        {
          filterStatus: "upcoming",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("6")

      vi.useRealTimers()
    })

    it("should filter by progress - gray", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterProgress: "gray",
        },
        mockTransactions
      )

      expect(result.map((goal) => goal._id)).toEqual(["1", "5", "6"])
    })

    it("should filter by progress - red", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterProgress: "red",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("2")
    })

    it("should filter by progress - yellow", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterProgress: "yellow",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("3")
    })

    it("should filter by progress - green", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterProgress: "green",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("4")
    })

    it("should combine multiple filters", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterCategoryKey: "business_freelance",
          filterMonth: "1",
          filterProgress: "yellow",
        },
        mockTransactions
      )

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("3")
    })

    it("should return all goals when no filters applied", () => {
      const result = filterGoals(mockGoals, {}, mockTransactions)

      expect(result).toHaveLength(mockGoals.length)
    })

    it("should handle empty goals array", () => {
      const result = filterGoals([], { searchTerm: "test" }, mockTransactions)

      expect(result).toEqual([])
    })

    it("should handle date range with only from date", () => {
      const fromDate = new Date("2024-01-01")
      const result = filterGoals(
        mockGoals,
        {
          dateRange: {
            from: fromDate,
          },
        },
        mockTransactions
      )

      expect(result.map((goal) => goal._id)).toEqual(["1", "2", "3", "4", "6"])
      result.forEach((goal) => {
        const end = new Date(goal.endDate)
        expect(end >= fromDate).toBe(true)
      })
    })

    it("should handle date range with only to date", () => {
      const toDate = new Date("2024-01-31")
      const result = filterGoals(
        mockGoals,
        {
          dateRange: {
            to: toDate,
          },
        },
        mockTransactions
      )

      expect(result.map((goal) => goal._id)).toEqual(["1", "2", "3", "4", "5"])
      result.forEach((goal) => {
        const start = new Date(goal.startDate)
        expect(start <= toDate).toBe(true)
      })
    })

    it("should return empty array when no matches found", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterCategoryKey: "nonexistent",
        },
        mockTransactions
      )

      expect(result).toEqual([])
    })
  })

  describe("filterRecurringTransactions", () => {
    it("should filter by search term", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        searchTerm: "salary",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Monthly Salary")
    })

    it("should filter by transaction type", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterType: "income",
      })

      expect(result).toHaveLength(2)
      expect(result.every((r) => r.type === "income")).toBe(true)
      expect(result.map((r) => r._id)).toEqual(["1", "5"])
    })

    it("should filter by category key", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterCategoryKey: "food_beverage",
      })

      expect(result).toHaveLength(2)
      expect(result.every((r) => r.categoryKey === "food_beverage")).toBe(true)
      expect(result.map((r) => r._id)).toEqual(["2", "6"])
    })

    it("should filter by status - active", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterStatus: "active",
      })

      expect(result).toHaveLength(5)
      expect(result.every((r) => r.isActive === true)).toBe(true)
      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "6", "7"])
    })

    it("should filter by status - inactive", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterStatus: "inactive",
      })

      expect(result).toHaveLength(2)
      expect(result.every((r) => r.isActive === false)).toBe(true)
      expect(result.map((r) => r._id)).toEqual(["4", "5"])
    })

    it("should filter by month", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterMonth: "1", // January
      })

      // Should include recurring transactions that start or end in January, or span January
      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const startMonth = new Date(recurring.startDate).getMonth() + 1
        const endMonth = recurring.endDate
          ? new Date(recurring.endDate).getMonth() + 1
          : null
        expect(
          startMonth === 1 ||
            (endMonth && endMonth === 1) ||
            (endMonth && startMonth < 1 && endMonth > 1)
        ).toBe(true)
      })
    })

    it("should filter by year", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2024",
      })

      // Should include recurring transactions that start or end in 2024, or span 2024
      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const startYear = new Date(recurring.startDate).getFullYear()
        const endYear = recurring.endDate
          ? new Date(recurring.endDate).getFullYear()
          : null
        expect(
          startYear === 2024 ||
            (endYear && endYear === 2024) ||
            (endYear && startYear < 2024 && endYear > 2024)
        ).toBe(true)
      })
    })

    it("should filter by date range", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-01-01"),
          to: new Date("2024-03-31"),
        },
      })

      // Should include recurring transactions that overlap with the date range
      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const startDate = new Date(recurring.startDate)
        const endDate = recurring.endDate
          ? new Date(recurring.endDate)
          : new Date("2099-12-31") // Treat undefined endDate as far future
        expect(
          endDate >= new Date("2024-01-01") &&
            startDate <= new Date("2024-03-31")
        ).toBe(true)
      })
    })

    it("should handle date range with only from date", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-03-01"),
        },
      })

      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const endDate = recurring.endDate
          ? new Date(recurring.endDate)
          : new Date("2099-12-31")
        expect(endDate >= new Date("2024-03-01")).toBe(true)
      })
    })

    it("should handle date range with only to date", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          to: new Date("2024-02-28"),
        },
      })

      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const startDate = new Date(recurring.startDate)
        expect(startDate <= new Date("2024-02-28")).toBe(true)
      })
    })

    it("should handle recurring transactions without endDate", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-05-01"),
        },
      })

      // Should include recurring transactions with undefined endDate
      const withUndefinedEndDate = result.filter((r) => !r.endDate)
      expect(withUndefinedEndDate.length).toBeGreaterThan(0)
    })

    it("should combine multiple filters", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        searchTerm: "monthly",
        filterType: "income",
        filterStatus: "active",
      })

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("1")
      expect(result[0].description).toBe("Monthly Salary")
    })

    it("should return all recurring transactions when no filters applied", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {})

      expect(result).toHaveLength(mockRecurringTransactions.length)
    })

    it("should handle empty recurring transactions array", () => {
      const result = filterRecurringTransactions([], {
        searchTerm: "test",
      })

      expect(result).toEqual([])
    })

    it("should handle case insensitive search", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        searchTerm: "SALARY",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Monthly Salary")
    })

    it("should handle partial search matches", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        searchTerm: "grocer",
      })

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe("Weekly Groceries")
    })

    it("should filter by month when recurring spans multiple months", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterMonth: "2", // February
      })

      // Should include recurring transactions that span February
      expect(result.length).toBeGreaterThan(0)
    })

    it("should filter by year when recurring spans multiple years", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2023",
      })

      // Should include recurring transactions that span 2023
      expect(result.length).toBeGreaterThan(0)
      result.forEach((recurring) => {
        const startYear = new Date(recurring.startDate).getFullYear()
        const endYear = recurring.endDate
          ? new Date(recurring.endDate).getFullYear()
          : null
        expect(
          startYear === 2023 ||
            (endYear && endYear === 2023) ||
            (endYear && startYear < 2023 && endYear > 2023)
        ).toBe(true)
      })
    })

    it("should return empty array when no matches found", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        searchTerm: "nonexistent",
      })

      expect(result).toEqual([])
    })

    it("should handle filterStatus 'all'", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterStatus: "all",
      })

      expect(result).toHaveLength(mockRecurringTransactions.length)
    })

    it("should handle filterType 'all'", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterType: "all",
      })

      expect(result).toHaveLength(mockRecurringTransactions.length)
    })

    it("should handle filterCategoryKey 'all'", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterCategoryKey: "all",
      })

      expect(result).toHaveLength(mockRecurringTransactions.length)
    })
  })
})
