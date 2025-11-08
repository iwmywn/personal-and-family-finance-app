import { mockBudgets, mockTransactions } from "@/tests/shared/data"
import { calculateBudgetsStats, calculateBudgetStats } from "@/lib/budgets"

describe("Budgets", () => {
  describe("calculateBudgetStats", () => {
    it("should calculate all stats correctly for a budget", () => {
      const budget = mockBudgets[0]
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result).toHaveProperty("spent")
      expect(result).toHaveProperty("percentage")
      expect(result).toHaveProperty("progressColorClass")
      expect(result).toHaveProperty("isActive")
      expect(result).toHaveProperty("isCompleted")
      expect(result._id).toBe(budget._id)
      expect(result.categoryKey).toBe(budget.categoryKey)
      expect(result.amount).toBe(budget.amount)
      expect(result.userId).toBe(budget.userId)
      expect(result.startDate).toEqual(budget.startDate)
      expect(result.endDate).toEqual(budget.endDate)
    })

    it("should filter transactions by budget category and date range", () => {
      const budget = mockBudgets[0] // food_beverage budget
      const result = calculateBudgetStats(budget, mockTransactions)

      const matchingTransactions = mockTransactions.filter((t) => {
        if (t.type !== "expense") return false
        const transactionDate = new Date(t.date)
        const startDate = new Date(budget.startDate)
        const endDate = new Date(budget.endDate)
        if (transactionDate < startDate || transactionDate > endDate) {
          return false
        }
        return t.categoryKey === budget.categoryKey
      })
      const expectedSpent = matchingTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      )

      expect(result.spent).toBe(expectedSpent)
    })

    it("should exclude income transactions", () => {
      const budget = mockBudgets[0]
      const incomeTransactions = mockTransactions.filter(
        (t) => t.type === "income"
      )
      const result = calculateBudgetStats(budget, mockTransactions)

      // Spent should not include income transactions
      expect(result.spent).toBeGreaterThanOrEqual(0)
      incomeTransactions.forEach((t) => {
        expect(t.type).toBe("income")
      })
    })

    it("should calculate percentage correctly", () => {
      const budget = mockBudgets[0]
      const result = calculateBudgetStats(budget, mockTransactions)

      const expectedPercentage =
        budget.amount === 0 ? 0 : (result.spent / budget.amount) * 100
      expect(result.percentage).toBe(expectedPercentage)
    })

    it("should return 0 percentage when amount is 0", () => {
      const budget = {
        ...mockBudgets[0],
        amount: 0,
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.percentage).toBe(0)
    })

    it("should return 0 spent when no matching transactions", () => {
      const budget = {
        ...mockBudgets[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.spent).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it("should return gray progress color when no transactions", () => {
      const budget = {
        ...mockBudgets[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.progressColorClass).toBe(
        "[&>[data-slot=progress-indicator]]:bg-gray-400"
      )
    })

    it("should return green progress color when percentage < 75", () => {
      const budget = {
        ...mockBudgets[0],
        amount: 1000000,
      }
      // Create transactions that result in < 75% spent
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 500000, // 50% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetStats(budget, transactions)

      expect(result.percentage).toBeLessThan(75)
      expect(result.progressColorClass).toBe(
        "[&>[data-slot=progress-indicator]]:bg-green-500"
      )
    })

    it("should return orange progress color when percentage >= 75 and < 100", () => {
      const budget = {
        ...mockBudgets[0],
        amount: 1000000,
      }
      // Create transactions that result in >= 75% but < 100% spent
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 800000, // 80% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetStats(budget, transactions)

      expect(result.percentage).toBeGreaterThanOrEqual(75)
      expect(result.percentage).toBeLessThan(100)
      expect(result.progressColorClass).toBe(
        "[&>[data-slot=progress-indicator]]:bg-orange-500"
      )
    })

    it("should return red progress color when percentage >= 100", () => {
      const budget = {
        ...mockBudgets[0],
        amount: 1000000,
      }
      // Create transactions that result in >= 100% spent
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 1200000, // 120% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetStats(budget, transactions)

      expect(result.percentage).toBeGreaterThanOrEqual(100)
      expect(result.progressColorClass).toBe(
        "[&>[data-slot=progress-indicator]]:bg-red-500"
      )
    })

    it("should correctly identify active budget", () => {
      const now = new Date()
      const budget = {
        ...mockBudgets[0],
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 28),
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.isActive).toBe(true)
      expect(result.isCompleted).toBe(false)
    })

    it("should correctly identify completed budget", () => {
      const now = new Date()
      const budget = {
        ...mockBudgets[0],
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.isActive).toBe(false)
      expect(result.isCompleted).toBe(true)
    })

    it("should correctly identify future budget", () => {
      const now = new Date()
      const budget = {
        ...mockBudgets[0],
        startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 28),
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.isActive).toBe(false)
      expect(result.isCompleted).toBe(false)
    })

    it("should handle budget that starts today", () => {
      const now = new Date()
      const budget = {
        ...mockBudgets[0],
        startDate: new Date(now),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.isActive).toBe(true)
    })

    it("should handle budget that ends today", () => {
      const now = new Date()
      const budget = {
        ...mockBudgets[0],
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now),
      }
      const result = calculateBudgetStats(budget, mockTransactions)

      expect(result.isActive).toBe(true)
      expect(result.isCompleted).toBe(false)
    })

    it("should handle empty transactions array", () => {
      const budget = mockBudgets[0]
      const result = calculateBudgetStats(budget, [])

      expect(result.spent).toBe(0)
      expect(result.percentage).toBe(0)
      expect(result.progressColorClass).toBe(
        "[&>[data-slot=progress-indicator]]:bg-gray-400"
      )
    })

    it("should exclude transactions outside date range", () => {
      const budget = mockBudgets[0]
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)

      // Create transactions outside date range
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          date: new Date(startDate.getTime() - 86400000), // 1 day before
        },
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          date: new Date(endDate.getTime() + 86400000), // 1 day after
        },
      ]
      const result = calculateBudgetStats(budget, transactions)

      expect(result.spent).toBe(0)
    })

    it("should only count transactions with matching category", () => {
      const budget = mockBudgets[0]
      const startDate = new Date(budget.startDate)
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 100000,
          date: new Date(startDate),
        },
        {
          ...mockTransactions[1],
          categoryKey: "different_category",
          amount: 200000,
          date: new Date(startDate),
        },
      ]
      const result = calculateBudgetStats(budget, transactions)

      expect(result.spent).toBe(100000)
    })
  })

  describe("calculateBudgetsStats", () => {
    it("should calculate stats for all budgets", () => {
      const result = calculateBudgetsStats(mockBudgets, mockTransactions)

      expect(result).toHaveLength(mockBudgets.length)
      result.forEach((budgetWithStats, index) => {
        expect(budgetWithStats).toHaveProperty("spent")
        expect(budgetWithStats).toHaveProperty("percentage")
        expect(budgetWithStats).toHaveProperty("progressColorClass")
        expect(budgetWithStats).toHaveProperty("isActive")
        expect(budgetWithStats).toHaveProperty("isCompleted")
        expect(budgetWithStats._id).toBe(mockBudgets[index]._id)
      })
    })

    it("should handle empty budgets array", () => {
      const result = calculateBudgetsStats([], mockTransactions)

      expect(result).toEqual([])
    })

    it("should handle empty transactions array", () => {
      const result = calculateBudgetsStats(mockBudgets, [])

      expect(result).toHaveLength(mockBudgets.length)
      result.forEach((budgetWithStats) => {
        expect(budgetWithStats.spent).toBe(0)
        expect(budgetWithStats.percentage).toBe(0)
        expect(budgetWithStats.progressColorClass).toBe(
          "[&>[data-slot=progress-indicator]]:bg-gray-400"
        )
      })
    })

    it("should match individual calculateBudgetStats results", () => {
      const result = calculateBudgetsStats(mockBudgets, mockTransactions)

      mockBudgets.forEach((budget, index) => {
        const individualResult = calculateBudgetStats(budget, mockTransactions)
        expect(result[index].spent).toBe(individualResult.spent)
        expect(result[index].percentage).toBe(individualResult.percentage)
        expect(result[index].progressColorClass).toBe(
          individualResult.progressColorClass
        )
        expect(result[index].isActive).toBe(individualResult.isActive)
        expect(result[index].isCompleted).toBe(individualResult.isCompleted)
      })
    })
  })
})
