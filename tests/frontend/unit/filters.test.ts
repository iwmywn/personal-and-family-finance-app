import {
  mockBudgets,
  mockCustomCategories,
  mockTransactions,
} from "@/tests/shared/data"
import {
  filterBudgets,
  filterCustomCategories,
  filterTransactions,
  includesCaseInsensitive,
  toDateOnly,
} from "@/lib/filters"

describe("Filters", () => {
  describe("toDateOnly", () => {
    it("should normalize to local midnight with same Y-M-D", () => {
      const d = new Date(2024, 0, 20, 15, 30, 45, 123)
      const only = toDateOnly(d)!

      expect(only.getFullYear()).toBe(d.getFullYear())
      expect(only.getMonth()).toBe(d.getMonth())
      expect(only.getDate()).toBe(d.getDate())
      expect(only.getHours()).toBe(0)
      expect(only.getMinutes()).toBe(0)
      expect(only.getSeconds()).toBe(0)
      expect(only.getMilliseconds()).toBe(0)
    })
  })

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
})
