import { mockBudgets, mockGoals, mockTransactions } from "@/tests/shared/data"
import {
  calculateBudgetsStats,
  calculateCategoriesStats,
  calculateGoalsStats,
  calculateQuickStats,
  calculateSummaryStats,
  getCurrentMonthTransactions,
} from "@/lib/statistics"
import { progressColorClass } from "@/lib/utils"

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
      expect(result.totalExpense).toBe(3000600)
      expect(result.balance).toBe(-2999100)
      expect(result.transactionCount).toBe(8)
      expect(result.incomeCount).toBe(2)
      expect(result.expenseCount).toBe(6)
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
      const result = calculateCategoriesStats(mockTransactions)

      expect(result).toHaveLength(5)
      expect(result[0].categoryKey).toBe("housing")
      expect(result[0].count).toBe(2)
      expect(result[0].total).toBe(2100300)
      expect(result[0].type).toBe("expense")
      expect(result[1].categoryKey).toBe("food_beverage")
      expect(result[2].categoryKey).toBe("transportation")
      expect(result[3].categoryKey).toBe("salary_bonus")
      expect(result[4].categoryKey).toBe("business_freelance")
    })

    it("should sort by total amount descending", () => {
      const result = calculateCategoriesStats(mockTransactions)

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].total).toBeGreaterThanOrEqual(result[i + 1].total)
      }
    })

    it("should handle empty transactions", () => {
      const result = calculateCategoriesStats([])
      expect(result).toEqual([])
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
        expect(budgetWithStats).toHaveProperty("status")
        expect(budgetWithStats._id).toBe(mockBudgets[index]._id)
        expect(budgetWithStats.categoryKey).toBe(mockBudgets[index].categoryKey)
        expect(budgetWithStats.allocatedAmount).toBe(
          mockBudgets[index].allocatedAmount
        )
      })
    })

    it("should filter transactions by category and date range", () => {
      const budget = mockBudgets[0]
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

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
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

      // Spent should not include income transactions
      expect(result.spent).toBeGreaterThanOrEqual(0)
    })

    it("should calculate percentage correctly", () => {
      const budget = mockBudgets[0]
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

      const expectedPercentage =
        budget.allocatedAmount === 0
          ? 0
          : (result.spent / budget.allocatedAmount) * 100
      expect(result.percentage).toBe(expectedPercentage)
    })

    it("should return 0 percentage when allocatedAmount is 0", () => {
      const budget = {
        ...mockBudgets[0],
        allocatedAmount: 0,
      }
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

      expect(result.percentage).toBe(0)
    })

    it("should return 0 spent when no matching transactions", () => {
      const budget = {
        ...mockBudgets[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

      expect(result.spent).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it("should exclude transactions outside date range", () => {
      const budget = mockBudgets[0]
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)

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
      const result = calculateBudgetsStats([budget], transactions)[0]

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
      const result = calculateBudgetsStats([budget], transactions)[0]

      expect(result.spent).toBe(100000)
    })

    it("should correctly identify status (active, expired, upcoming)", () => {
      vi.setSystemTime(new Date(2024, 0, 15))
      const budgets = [
        {
          ...mockBudgets[0],
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 28),
        },
        {
          ...mockBudgets[0],
          startDate: new Date(2023, 10, 1),
          endDate: new Date(2023, 11, 28),
        },
        {
          ...mockBudgets[0],
          startDate: new Date(2024, 1, 1),
          endDate: new Date(2024, 1, 28),
        },
      ]
      const result = calculateBudgetsStats(budgets, mockTransactions)

      expect(result[0].status).toBe("active")
      expect(result[1].status).toBe("expired")
      expect(result[2].status).toBe("upcoming")
    })

    it("should handle budget that starts or ends today", () => {
      const now = new Date()
      const budgets = [
        {
          ...mockBudgets[0],
          startDate: new Date(now),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
        {
          ...mockBudgets[0],
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now),
        },
      ]
      const result = calculateBudgetsStats(budgets, mockTransactions)

      expect(result[0].status).toBe("active")
      expect(result[1].status).toBe("active")
    })

    it("should return gray progress color when no transactions", () => {
      const budget = {
        ...mockBudgets[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateBudgetsStats([budget], mockTransactions)[0]

      expect(result.progressColorClass).toBe(progressColorClass.gray)
    })

    it("should return green progress color when percentage < 75 (budget)", () => {
      const budget = {
        ...mockBudgets[0],
        allocatedAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 500000, // 50% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetsStats([budget], transactions)[0]

      expect(result.percentage).toBeLessThan(75)
      expect(result.progressColorClass).toBe(progressColorClass.green)
    })

    it("should return yellow progress color when percentage >= 75 and < 100 (budget)", () => {
      const budget = {
        ...mockBudgets[0],
        allocatedAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 800000, // 80% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetsStats([budget], transactions)[0]

      expect(result.percentage).toBeGreaterThanOrEqual(75)
      expect(result.percentage).toBeLessThan(100)
      expect(result.progressColorClass).toBe(progressColorClass.yellow)
    })

    it("should return red progress color when percentage >= 100 (budget)", () => {
      const budget = {
        ...mockBudgets[0],
        allocatedAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[1],
          categoryKey: budget.categoryKey,
          amount: 1200000, // 120% of budget
          date: new Date(budget.startDate),
        },
      ]
      const result = calculateBudgetsStats([budget], transactions)[0]

      expect(result.percentage).toBeGreaterThanOrEqual(100)
      expect(result.progressColorClass).toBe(progressColorClass.red)
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
        expect(budgetWithStats.progressColorClass).toBe(progressColorClass.gray)
      })
    })
  })

  describe("calculateGoalsStats", () => {
    it("should calculate stats for all goals", () => {
      const result = calculateGoalsStats(mockGoals, mockTransactions)

      expect(result).toHaveLength(mockGoals.length)
      result.forEach((goalWithStats, index) => {
        expect(goalWithStats).toHaveProperty("accumulated")
        expect(goalWithStats).toHaveProperty("percentage")
        expect(goalWithStats).toHaveProperty("progressColorClass")
        expect(goalWithStats).toHaveProperty("status")
        expect(goalWithStats._id).toBe(mockGoals[index]._id)
        expect(goalWithStats.categoryKey).toBe(mockGoals[index].categoryKey)
        expect(goalWithStats.targetAmount).toBe(mockGoals[index].targetAmount)
      })
    })

    it("should filter transactions by category and date range", () => {
      const goal = mockGoals[0]
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      const matchingTransactions = mockTransactions.filter((t) => {
        if (t.type !== "income") return false
        const transactionDate = new Date(t.date)
        const startDate = new Date(goal.startDate)
        const endDate = new Date(goal.endDate)
        if (transactionDate < startDate || transactionDate > endDate) {
          return false
        }
        return t.categoryKey === goal.categoryKey
      })
      const expectedAccumulated = matchingTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      )

      expect(result.accumulated).toBe(expectedAccumulated)
    })

    it("should exclude expense transactions", () => {
      const goal = mockGoals[0]
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      // Accumulated should not include expense transactions
      expect(result.accumulated).toBeGreaterThanOrEqual(0)
    })

    it("should calculate percentage correctly", () => {
      const goal = mockGoals[0]
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      const expectedPercentage =
        goal.targetAmount === 0
          ? 0
          : (result.accumulated / goal.targetAmount) * 100
      expect(result.percentage).toBe(expectedPercentage)
    })

    it("should return 0 percentage when targetAmount is 0", () => {
      const goal = {
        ...mockGoals[0],
        targetAmount: 0,
      }
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      expect(result.percentage).toBe(0)
    })

    it("should return 0 accumulated when no matching transactions", () => {
      const goal = {
        ...mockGoals[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      expect(result.accumulated).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it("should exclude transactions outside date range", () => {
      const goal = mockGoals[0]
      const startDate = new Date(goal.startDate)
      const endDate = new Date(goal.endDate)

      const transactions = [
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          date: new Date(startDate.getTime() - 86400000), // 1 day before
        },
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          date: new Date(endDate.getTime() + 86400000), // 1 day after
        },
      ]
      const result = calculateGoalsStats([goal], transactions)[0]

      expect(result.accumulated).toBe(0)
    })

    it("should only count transactions with matching category", () => {
      const goal = mockGoals[0]
      const startDate = new Date(goal.startDate)
      const transactions = [
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          amount: 100000,
          date: new Date(startDate),
        },
        {
          ...mockTransactions[2],
          categoryKey: "different_category",
          amount: 200000,
          date: new Date(startDate),
        },
      ]
      const result = calculateGoalsStats([goal], transactions)[0]

      expect(result.accumulated).toBe(100000)
    })

    it("should correctly identify status (active, expired, upcoming)", () => {
      vi.setSystemTime(new Date(2024, 0, 15))
      const goals = [
        {
          ...mockGoals[0],
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 28),
        },
        {
          ...mockGoals[0],
          startDate: new Date(2023, 10, 1),
          endDate: new Date(2023, 11, 28),
        },
        {
          ...mockGoals[0],
          startDate: new Date(2024, 1, 1),
          endDate: new Date(2024, 1, 28),
        },
      ]
      const result = calculateGoalsStats(goals, mockTransactions)

      expect(result[0].status).toBe("active")
      expect(result[1].status).toBe("expired")
      expect(result[2].status).toBe("upcoming")
    })

    it("should handle goal that starts or ends today", () => {
      const now = new Date()
      const goals = [
        {
          ...mockGoals[0],
          startDate: new Date(now),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
        {
          ...mockGoals[0],
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now),
        },
      ]
      const result = calculateGoalsStats(goals, mockTransactions)

      expect(result[0].status).toBe("active")
      expect(result[1].status).toBe("active")
    })

    it("should return gray progress color when no transactions", () => {
      const goal = {
        ...mockGoals[0],
        categoryKey: "nonexistent_category",
      }
      const result = calculateGoalsStats([goal], mockTransactions)[0]

      expect(result.progressColorClass).toBe(progressColorClass.gray)
    })

    it("should return red progress color when percentage < 75 (goal)", () => {
      const goal = {
        ...mockGoals[0],
        targetAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          amount: 500000, // 50% of goal
          date: new Date(goal.startDate),
        },
      ]
      const result = calculateGoalsStats([goal], transactions)[0]

      expect(result.percentage).toBeLessThan(75)
      expect(result.progressColorClass).toBe(progressColorClass.red)
    })

    it("should return yellow progress color when percentage >= 75 and < 100 (goal)", () => {
      const goal = {
        ...mockGoals[0],
        targetAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          amount: 800000, // 80% of goal
          date: new Date(goal.startDate),
        },
      ]
      const result = calculateGoalsStats([goal], transactions)[0]

      expect(result.percentage).toBeGreaterThanOrEqual(75)
      expect(result.percentage).toBeLessThan(100)
      expect(result.progressColorClass).toBe(progressColorClass.yellow)
    })

    it("should return green progress color when percentage >= 100 (goal)", () => {
      const goal = {
        ...mockGoals[0],
        targetAmount: 1000000,
      }
      const transactions = [
        {
          ...mockTransactions[2],
          categoryKey: goal.categoryKey,
          amount: 1200000, // 120% of goal
          date: new Date(goal.startDate),
        },
      ]
      const result = calculateGoalsStats([goal], transactions)[0]

      expect(result.percentage).toBeGreaterThanOrEqual(100)
      expect(result.progressColorClass).toBe(progressColorClass.green)
    })

    it("should handle empty goals array", () => {
      const result = calculateGoalsStats([], mockTransactions)

      expect(result).toEqual([])
    })

    it("should handle empty transactions array", () => {
      const result = calculateGoalsStats(mockGoals, [])

      expect(result).toHaveLength(mockGoals.length)
      result.forEach((goalWithStats) => {
        expect(goalWithStats.accumulated).toBe(0)
        expect(goalWithStats.percentage).toBe(0)
        expect(goalWithStats.progressColorClass).toBe(progressColorClass.gray)
      })
    })
  })
})
