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
    it("should return null for null or undefined", () => {
      expect(toDateOnly(null)).toBeNull()
      expect(toDateOnly(undefined)).toBeNull()
    })

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

      expect(result).toHaveLength(1)
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

      expect(result).toHaveLength(4)
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

      expect(result).toHaveLength(5)
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

      expect(result).toHaveLength(3)
      expect(result.map((t) => t._id)).toEqual(["3", "4", "5"])
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
    const mockGetCategoryLabel = (categoryKey: string): string => {
      const categoryMap: Record<string, string> = {
        food_beverage: "Food & Beverage",
        transportation: "Transportation",
        housing: "Housing",
        business_freelance: "Business & Freelance",
      }
      return categoryMap[categoryKey] || categoryKey
    }

    it("should filter by search term", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "food" },
        mockGetCategoryLabel
      )

      expect(result).toHaveLength(2)
      expect(result.every((b) => b.categoryKey === "food_beverage")).toBe(true)
    })

    it("should filter by active status", () => {
      const result = filterBudgets(
        mockBudgets,
        { filterStatus: "active" },
        mockGetCategoryLabel
      )

      // Should return budgets where startDate <= now && endDate >= now
      expect(result.length).toBeGreaterThan(0)
      const now = new Date()
      result.forEach((budget) => {
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate)
        expect(startDate <= now && endDate >= now).toBe(true)
      })
    })

    it("should filter by completed status", () => {
      const result = filterBudgets(
        mockBudgets,
        { filterStatus: "completed" },
        mockGetCategoryLabel
      )

      // Should return budgets where endDate < now
      expect(result.length).toBeGreaterThan(0)
      const now = new Date()
      result.forEach((budget) => {
        const endDate = new Date(budget.endDate)
        expect(endDate < now).toBe(true)
      })
    })

    it("should return all budgets when filterStatus is 'all'", () => {
      const result = filterBudgets(
        mockBudgets,
        { filterStatus: "all" },
        mockGetCategoryLabel
      )

      expect(result).toHaveLength(mockBudgets.length)
    })

    it("should combine search and status filters", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "food", filterStatus: "active" },
        mockGetCategoryLabel
      )

      // Should return active food_beverage budgets only
      expect(result.length).toBeGreaterThan(0)
      result.forEach((budget) => {
        expect(budget.categoryKey).toBe("food_beverage")
        const now = new Date()
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate)
        expect(startDate <= now && endDate >= now).toBe(true)
      })
    })

    it("should return all budgets when no filters applied", () => {
      const result = filterBudgets(mockBudgets, {}, mockGetCategoryLabel)

      expect(result).toHaveLength(mockBudgets.length)
    })

    it("should handle empty budgets array", () => {
      const result = filterBudgets(
        [],
        { searchTerm: "test" },
        mockGetCategoryLabel
      )

      expect(result).toEqual([])
    })

    it("should handle case insensitive search", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "FOOD" },
        mockGetCategoryLabel
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result.every((b) => b.categoryKey === "food_beverage")).toBe(true)
    })

    it("should handle partial search matches", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "trans" },
        mockGetCategoryLabel
      )

      expect(result.length).toBeGreaterThan(0)
      expect(result.every((b) => b.categoryKey === "transportation")).toBe(true)
    })

    it("should return empty array when no matches found", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "nonexistent" },
        mockGetCategoryLabel
      )

      expect(result).toEqual([])
    })

    it("should trim search term whitespace", () => {
      const result1 = filterBudgets(
        mockBudgets,
        { searchTerm: "  food  " },
        mockGetCategoryLabel
      )
      const result2 = filterBudgets(
        mockBudgets,
        { searchTerm: "food" },
        mockGetCategoryLabel
      )

      expect(result1).toEqual(result2)
    })

    it("should handle empty search term", () => {
      const result = filterBudgets(
        mockBudgets,
        { searchTerm: "" },
        mockGetCategoryLabel
      )

      expect(result).toHaveLength(mockBudgets.length)
    })
  })
})
