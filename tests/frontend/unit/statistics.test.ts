import { mockTransactions } from "@/tests/shared/data"
import {
  calculateCategoryStats,
  calculateQuickStats,
  calculateSummaryStats,
  getCurrentMonthTransactions,
} from "@/lib/statistics"

describe("Statistics", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getCurrentMonthTransactions", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date("2024-01-26"))
    })

    it("should return only transactions from current month", () => {
      const result = getCurrentMonthTransactions(mockTransactions)

      expect(result).toHaveLength(4)
      expect(result.map((t) => t._id)).toEqual(["2", "3", "4", "5"])
    })

    it("should return empty array when no transactions in current month", () => {
      const oldTransactions = mockTransactions.map((t) => ({
        ...t,
        date: new Date("2023-12-15"),
      }))

      const result = getCurrentMonthTransactions(oldTransactions)
      expect(result).toEqual([])
    })

    it("should handle transactions from different years", () => {
      const mixedTransactions = [
        ...mockTransactions,
        {
          _id: "6",
          userId: "68f712e4cda4897217a05a1c",
          type: "income" as const,
          amount: 200,
          description: "Old income",
          categoryKey: "salary_bonus" as const,
          date: new Date("2023-01-15"),
        },
      ]

      const result = getCurrentMonthTransactions(mixedTransactions)
      expect(result).toHaveLength(4)
      expect(result.map((t) => t._id)).toEqual(["2", "3", "4", "5"])
    })

    it("should handle edge case dates correctly", () => {
      const edgeTransactions = [
        {
          _id: "1",
          userId: "68f712e4cda4897217a05a1c",
          type: "income" as const,
          amount: 100,
          description: "First day",
          categoryKey: "salary_bonus" as const,
          date: new Date("2024-01-01"),
        },
        {
          _id: "2",
          userId: "68f712e4cda4897217a05a1c",
          type: "expense" as const,
          amount: 50,
          description: "Last day",
          categoryKey: "food_beverage" as const,
          date: new Date("2024-01-31"),
        },
        {
          _id: "3",
          userId: "68f712e4cda4897217a05a1c",
          type: "income" as const,
          amount: 200,
          description: "Next month",
          categoryKey: "salary_bonus" as const,
          date: new Date("2024-02-01"),
        },
      ]

      const result = getCurrentMonthTransactions(edgeTransactions)
      expect(result).toHaveLength(2)
      expect(result.map((t) => t._id)).toEqual(["1", "2"])
    })
  })

  describe("calculateQuickStats", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date("2024-01-26"))
    })

    it("should calculate all quick stats correctly", () => {
      const result = calculateQuickStats(mockTransactions)

      expect(result.currentMonthCount).toBe(4)
      expect(result.highestTransaction).toEqual(mockTransactions[2])
      expect(result.lowestTransaction).toEqual(mockTransactions[3])
      expect(result.avgExpense).toBe(200)
      expect(result.savingsRate).toBe("-20")
      expect(result.popularCategory).toEqual(["business_freelance"])
    })

    it("should handle empty transactions", () => {
      const result = calculateQuickStats([])

      expect(result.currentMonthCount).toBe(0)
      expect(result.highestTransaction).toBeNull()
      expect(result.lowestTransaction).toBeNull()
      expect(result.avgExpense).toBeNull()
      expect(result.savingsRate).toBeNull()
      expect(result.popularCategory).toEqual([])
    })
  })

  describe("calculateSummaryStats", () => {
    it("should calculate summary stats correctly", () => {
      const result = calculateSummaryStats(mockTransactions)

      expect(result.totalIncome).toBe(1500)
      expect(result.totalExpense).toBe(600)
      expect(result.balance).toBe(900)
      expect(result.transactionCount).toBe(5)
      expect(result.incomeCount).toBe(2)
      expect(result.expenseCount).toBe(3)
    })

    it("should handle empty transactions", () => {
      const result = calculateSummaryStats([])

      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
      expect(result.transactionCount).toBe(0)
      expect(result.incomeCount).toBe(0)
      expect(result.expenseCount).toBe(0)
    })
  })

  describe("calculateCategoryStats", () => {
    it("should calculate category stats correctly", () => {
      const result = calculateCategoryStats(mockTransactions)

      expect(result).toHaveLength(5)
      expect(result[0].categoryKey).toBe("salary_bonus")
      expect(result[0].count).toBe(1)
      expect(result[0].total).toBe(1000)
      expect(result[0].type).toBe("income")
      expect(result[1].categoryKey).toBe("business_freelance")
      expect(result[2].categoryKey).toBe("housing")
      expect(result[3].categoryKey).toBe("food_beverage")
      expect(result[4].categoryKey).toBe("transportation")
    })

    it("should sort by total amount descending", () => {
      const result = calculateCategoryStats(mockTransactions)

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].total).toBeGreaterThanOrEqual(result[i + 1].total)
      }
    })

    it("should handle empty transactions", () => {
      const result = calculateCategoryStats([])
      expect(result).toEqual([])
    })
  })
})
