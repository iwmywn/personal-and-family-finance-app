import { ObjectId } from "mongodb"

import { insertTestBudget } from "@/tests/backend/helpers/database"
import {
  mockBudgetCollectionError,
  setupBudgetCollectionMock,
} from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockBudget,
  mockUser,
  mockValidBudgetValues,
} from "@/tests/shared/data"
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "@/actions/budget.actions"
import { getBudgetsCollection } from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"

describe("Budgets", async () => {
  describe("createBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error when budget already exists", async () => {
      await insertTestBudget(mockBudget)
      mockAuthenticatedUser()

      const result = await createBudget({
        categoryKey: mockBudget.categoryKey,
        currency: mockBudget.currency,
        allocatedAmount: "2000000",
        startDate: normalizeToUTCDate(mockBudget.startDate),
        endDate: normalizeToUTCDate(mockBudget.endDate),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("This budget already exists!")
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockBudgetsCollection = setupBudgetCollectionMock()
      mockBudgetsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Failed to add budget! Please try again later.")
    })

    it("should successfully create budget", async () => {
      mockAuthenticatedUser()

      const result = await createBudget(mockValidBudgetValues)
      const budgetsCollection = await getBudgetsCollection()
      const addedBudget = await budgetsCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedBudget?.categoryKey).toBe("food_beverage")
      expect(addedBudget?.allocatedAmount.toString()).toBe("1000000")
      expect(addedBudget?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(addedBudget?.endDate.toISOString()).toBe(
        "2024-01-31T00:00:00.000Z"
      )
      expect(result.success).toBe("Budget has been added.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Failed to add budget! Please try again later.")
    })
  })

  describe("updateBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateBudget(
        mockBudget._id.toString(),
        mockValidBudgetValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget("invalid-id", mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid budget ID!")
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget(
        mockBudget._id.toString(),
        mockValidBudgetValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Budget not found or you don't have permission to edit!"
      )
    })

    it("should successfully update budget", async () => {
      await Promise.all([
        insertTestBudget(mockBudget),
        insertTestBudget({
          ...mockBudget,
          _id: new ObjectId("690ec0c23f50e19549bd7e52"),
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateBudget(mockBudget._id.toString(), {
        categoryKey: "transportation",
        allocatedAmount: "2000000",
        currency: "VND",
        startDate: normalizeToUTCDate(new Date("2024-02-01")),
        endDate: normalizeToUTCDate(new Date("2024-02-29")),
      })
      const budgetsCollection = await getBudgetsCollection()
      const updatedBudget = await budgetsCollection.findOne({
        _id: mockBudget._id,
      })
      const unrelatedBudget = await budgetsCollection.findOne({
        _id: new ObjectId("690ec0c23f50e19549bd7e52"),
      })

      expect(updatedBudget?.categoryKey).toBe("transportation")
      expect(updatedBudget?.allocatedAmount.toString()).toBe("2000000")
      expect(updatedBudget?.startDate.toISOString()).toBe(
        "2024-02-01T00:00:00.000Z"
      )
      expect(updatedBudget?.endDate.toISOString()).toBe(
        "2024-02-29T00:00:00.000Z"
      )
      expect(unrelatedBudget?.categoryKey).toBe("food_beverage")
      expect(unrelatedBudget?.allocatedAmount.toString()).toBe("1000000")
      expect(unrelatedBudget?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(unrelatedBudget?.endDate.toISOString()).toBe(
        "2024-01-31T00:00:00.000Z"
      )
      expect(result.success).toBe("Budget has been updated.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await updateBudget(
        mockBudget._id.toString(),
        mockValidBudgetValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to update budget! Please try again later."
      )
    })
  })

  describe("deleteBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid budget ID!")
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Budget not found or you don't have permission to delete!"
      )
    })

    it("should successfully delete budget", async () => {
      await insertTestBudget(mockBudget)
      mockAuthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())
      const budgetsCollection = await getBudgetsCollection()
      const deletedBudget = await budgetsCollection.findOne({
        _id: mockBudget._id,
      })

      expect(deletedBudget).toBe(null)
      expect(result.success).toBe("Budget has been deleted.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to delete budget! Please try again later."
      )
    })
  })

  describe("getBudgets", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getBudgets("")

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return empty budgets list", async () => {
      mockAuthenticatedUser()

      const result = await getBudgets(mockUser._id.toString())

      expect(result.budgets).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return budgets list", async () => {
      await insertTestBudget(mockBudget)
      mockAuthenticatedUser()

      const result = await getBudgets(mockUser._id.toString())

      expect(result.budgets).toHaveLength(1)
      expect(result.budgets?.[0].categoryKey).toBe("food_beverage")
      expect(result.budgets?.[0].allocatedAmount).toBe("1000000")
      expect(result.error).toBeUndefined()
    })

    it("should return budgets sorted by startDate and _id descending", async () => {
      const budget1 = {
        ...mockBudget,
        _id: new ObjectId("68f795d4bdcc3c9a30717988"),
        startDate: normalizeToUTCDate(new Date("2024-01-01")),
      }
      const budget2 = {
        ...mockBudget,
        _id: new ObjectId("68f795d4bdcc3c9a30717989"),
        startDate: normalizeToUTCDate(new Date("2024-01-01")),
      }
      const budget3 = {
        ...mockBudget,
        _id: new ObjectId("68f795d4bdcc3c9a30717990"),
        startDate: normalizeToUTCDate(new Date("2024-02-01")),
      }

      await Promise.all([
        insertTestBudget(budget1),
        insertTestBudget(budget2),
        insertTestBudget(budget3),
      ])
      mockAuthenticatedUser()

      const result = await getBudgets(mockUser._id.toString())

      expect(result.budgets).toHaveLength(3)
      // Should be sorted by startDate descending, then _id descending
      expect(result.budgets?.[0].startDate.toISOString()).toBe(
        "2024-02-01T00:00:00.000Z"
      )
      expect(result.budgets?.[1]._id).toBe("68f795d4bdcc3c9a30717989")
      expect(result.budgets?.[2]._id).toBe("68f795d4bdcc3c9a30717988")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await getBudgets(mockUser._id.toString())

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(
        "Failed to load budgets! Please try again later."
      )
    })
  })
})
