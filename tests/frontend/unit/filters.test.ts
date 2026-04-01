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
  isDateRangeOverlapping,
} from "@/lib/filters"

describe("Filters", () => {
  describe("isDateRangeOverlapping", () => {
    it("should return true when filter is empty", () => {
      expect(
        isDateRangeOverlapping(
          new Date("2024-01-01"),
          new Date("2024-12-31"),
          null,
          null
        )
      ).toBe(true)
    })

    it("should properly overlap cross-year ranges (e.g. Nov 2023 to Mar 2024)", () => {
      const start = new Date("2023-11-01T00:00:00Z")
      const end = new Date("2024-03-31T00:00:00Z")

      // Jan 2024 -> Overlaps
      expect(isDateRangeOverlapping(start, end, 1, 2024)).toBe(true)

      // Dec 2023 -> Overlaps
      expect(isDateRangeOverlapping(start, end, 12, 2023)).toBe(true)

      // Apr 2024 -> NOT overlap
      expect(isDateRangeOverlapping(start, end, 4, 2024)).toBe(false)

      // Oct 2023 -> NOT overlap
      expect(isDateRangeOverlapping(start, end, 10, 2023)).toBe(false)
    })

    it("should correctly handle filtering by ONLY month for cross-year", () => {
      const start = new Date("2023-11-01T00:00:00Z")
      const end = new Date("2024-03-31T00:00:00Z")

      // Month = 1 (Jan) spans
      expect(isDateRangeOverlapping(start, end, 1, null)).toBe(true)

      // Month = 12 (Dec) spans
      expect(isDateRangeOverlapping(start, end, 12, null)).toBe(true)

      // Month = 2 (Feb) spans
      expect(isDateRangeOverlapping(start, end, 2, null)).toBe(true)

      // Month = 4 (Apr) does NOT span
      expect(isDateRangeOverlapping(start, end, 4, null)).toBe(false)

      // Month = 11 (Nov) spans
      expect(isDateRangeOverlapping(start, end, 11, null)).toBe(true)
    })

    it("should correctly handle infinite end dates", () => {
      const start = new Date("2024-04-01T00:00:00Z")
      const end = null

      // Month = 1 (Jan), Year = null -> infinite, eventually hits Jan
      expect(isDateRangeOverlapping(start, end, 1, null)).toBe(true)

      // Month = 1, Year = 2024 -> Only active after Apr 2024. Jan 2024 is FALSE!
      expect(isDateRangeOverlapping(start, end, 1, 2024)).toBe(false)

      // Month = 5, Year = 2024 -> Active
      expect(isDateRangeOverlapping(start, end, 5, 2024)).toBe(true)

      // Month = 1, Year = 2025 -> Active!
      expect(isDateRangeOverlapping(start, end, 1, 2025)).toBe(true)
    })
  })

  describe("filterTransactions", () => {
    it("should filter by search term", () => {
      const result = filterTransactions(mockTransactions, {
        searchTerm: "salary",
      })

      expect(result).toHaveLength(2)
      expect(result[0].description).toBe("Salary")
    })

    it("should filter by transaction type", () => {
      const result = filterTransactions(mockTransactions, {
        filterType: "income",
      })

      expect(result).toHaveLength(3)
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

      expect(result).toHaveLength(6)
      expect(result.every((t) => new Date(t.date).getMonth() === 0)).toBe(true)
      expect(result.map((t) => t._id)).toEqual(["1", "2", "3", "4", "5", "9"])
    })

    it("should filter by year", () => {
      const result = filterTransactions(mockTransactions, {
        filterYear: "2024",
      })

      expect(result).toHaveLength(8)
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

      expect(result).toHaveLength(9)
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

      expect(result).toHaveLength(2)
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

      expect(result).toHaveLength(7)
      expect(result.map((t) => t._id)).toEqual([
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ])
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

      expect(result.map((goal) => goal._id)).toEqual(["5", "6"])
    })

    it("should filter by progress - red", () => {
      const result = filterGoals(
        mockGoals,
        {
          filterProgress: "red",
        },
        mockTransactions
      )

      expect(result).toHaveLength(2)
      expect(result[0]._id).toBe("1")
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

      expect(result).toHaveLength(6)
      expect(result.every((r) => r.isActive === true)).toBe(true)
      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "6", "7", "8"])
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

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "6", "7", "8"])
    })

    it("should filter by year", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2024",
      })

      expect(result.map((r) => r._id)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "6",
        "7",
        "8",
      ])
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

      expect(result).toHaveLength(8)
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

      expect(result.map((r) => r._id)).toEqual(["1", "2", "3", "6", "7", "8"])
    })

    it("should filter by year when recurring spans multiple years", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterYear: "2023",
      })

      expect(result.map((r) => r._id)).toEqual(["5", "8"])
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

      expect(result).toHaveLength(8)
    })

    it("should handle filterType 'all'", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterType: "all",
      })

      expect(result).toHaveLength(8)
    })

    it("should handle filterCategoryKey 'all'", () => {
      const result = filterRecurringTransactions(mockRecurringTransactions, {
        filterCategoryKey: "all",
      })

      expect(result).toHaveLength(8)
    })
  })
})
