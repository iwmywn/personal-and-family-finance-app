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

      expect(result.map((b) => b._id)).toEqual(["1", "4"])
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

      expect(result.map((b) => b._id)).toEqual(["1", "2", "4", "5"])

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

      expect(result.map((b) => b._id)).toEqual(["2", "4"])

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

      expect(result.map((b) => b._id)).toEqual(["1", "2", "3", "4"])

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

      expect(result.map((b) => b._id)).toEqual(["2", "4"])
    })

    it("should filter by month", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterMonth: "3", // March 2024
        },
        mockTransactions
      )

      expect(result.map((b) => b._id)).toEqual(["2", "4"])
    })

    it("should filter by year", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterYear: "2024",
        },
        mockTransactions
      )

      expect(result.map((b) => b._id)).toEqual(["1", "2", "3", "4"])
    })

    it("should filter by progress - gray (no transactions)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "gray",
        },
        mockTransactions
      )

      expect(result.map((b) => b._id)).toEqual(["4", "5"])
    })

    it("should filter by progress - green (< 75%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "green",
        },
        mockTransactions
      )

      // Budget 1: 500000 / 1000000 = 50% (green)
      expect(result.map((b) => b._id)).toEqual(["1"])
    })

    it("should filter by progress - yellow (75-100%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "yellow",
        },
        mockTransactions
      )

      // Budget 2: 400000 / 500000 = 80% (yellow)
      expect(result.map((b) => b._id)).toEqual(["2"])
    })

    it("should filter by progress - red (>= 100%)", () => {
      const result = filterBudgets(
        mockBudgets,
        {
          filterProgress: "red",
        },
        mockTransactions
      )

      // Budget 3: 2100000 / 2000000 = 105% (red)
      expect(result.map((b) => b._id)).toEqual(["3"])
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

      expect(result.map((b) => b._id)).toEqual(["4"])
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

      expect(result.map((b) => b._id)).toEqual(["2", "3", "4"])
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

      expect(result.map((b) => b._id)).toEqual(["1", "2", "4", "5"])
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

      expect(result.map((goal) => goal._id)).toEqual(["3", "4", "5"])

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

      expect(result.map((goal) => goal._id)).toEqual(["1", "2", "3", "4"])

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
        filterMonth: "1",
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "6"])
    })

    it("should filter by year", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2024",
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "4", "6", "7"])
    })

    it("should filter by date range", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-01-01"),
          to: new Date("2024-03-31"),
        },
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "4", "6"])
    })

    it("should handle date range with only from date", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-03-01"),
        },
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "4", "7"])
    })

    it("should handle date range with only to date", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          to: new Date("2024-02-28"),
        },
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "5", "6"])
    })

    it("should handle recurring transactions without endDate", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        dateRange: {
          from: new Date("2024-05-01"),
        },
      })

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "7"])
      const withUndefinedEndDate = result.filter((r) => !r.endDate)
      expect(withUndefinedEndDate.map((r) => r._id)).toEqual(["3", "7"])
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

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "6"])
    })

    it("should filter by year when recurring spans multiple years", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2023",
      })

      expect(result.map((r) => r._id)).toEqual(["5"])
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
