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
} from "@/actions/budgets"
import { getBudgetsCollection } from "@/lib/collections"

describe("Budgets", () => {
  describe("createBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createBudget({
        categoryKey: "",
        amount: -1,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-01"), // endDate <= startDate
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockBudgetsCollection = setupBudgetCollectionMock()
      mockBudgetsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("budgetAddFailed"))
    })

    it("should successfully create budget", async () => {
      mockAuthenticatedUser()

      const result = await createBudget(mockValidBudgetValues)
      const budgetsCollection = await getBudgetsCollection()
      const addedBudget = await budgetsCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedBudget?.categoryKey).toBe("food_beverage")
      expect(addedBudget?.amount).toBe(1000000)
      expect(addedBudget?.startDate).toEqual(new Date("2024-01-01"))
      expect(addedBudget?.endDate).toEqual(new Date("2024-01-31"))
      expect(result.success).toBe(tBudgetsBE("budgetAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("budgetAddFailed"))
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
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget(mockBudget._id.toString(), {
        categoryKey: "",
        amount: -1,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-01"), // endDate <= startDate
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget("invalid-id", mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("invalidBudgetId"))
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget(
        mockBudget._id.toString(),
        mockValidBudgetValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("budgetNotFoundOrNoPermission"))
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
        amount: 2000000,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-29"),
      })
      const budgetsCollection = await getBudgetsCollection()
      const updatedBudget = await budgetsCollection.findOne({
        _id: mockBudget._id,
      })
      const unrelatedBudget = await budgetsCollection.findOne({
        _id: new ObjectId("690ec0c23f50e19549bd7e52"),
      })

      expect(updatedBudget?.categoryKey).toBe("transportation")
      expect(updatedBudget?.amount).toBe(2000000)
      expect(updatedBudget?.startDate).toEqual(new Date("2024-02-01"))
      expect(updatedBudget?.endDate).toEqual(new Date("2024-02-29"))
      expect(unrelatedBudget?.categoryKey).toBe("food_beverage")
      expect(unrelatedBudget?.amount).toBe(1000000)
      expect(unrelatedBudget?.startDate).toEqual(new Date("2024-01-01"))
      expect(unrelatedBudget?.endDate).toEqual(new Date("2024-01-31"))
      expect(result.success).toBe(tBudgetsBE("budgetUpdated"))
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
      expect(result.error).toBe(tBudgetsBE("budgetUpdateFailed"))
    })
  })

  describe("deleteBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("invalidBudgetId"))
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        tBudgetsBE("budgetNotFoundOrNoPermissionDelete")
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
      expect(result.success).toBe(tBudgetsBE("budgetDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("budgetDeleteFailed"))
    })
  })

  describe("getBudgets", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getBudgets()

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return empty budgets list", async () => {
      mockAuthenticatedUser()

      const result = await getBudgets()

      expect(result.budgets).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return budgets list", async () => {
      await insertTestBudget(mockBudget)
      mockAuthenticatedUser()

      const result = await getBudgets()

      expect(result.budgets).toHaveLength(1)
      expect(result.budgets?.[0].categoryKey).toBe("food_beverage")
      expect(result.budgets?.[0].amount).toBe(1000000)
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await getBudgets()

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(tBudgetsBE("budgetFetchFailed"))
    })
  })
})
