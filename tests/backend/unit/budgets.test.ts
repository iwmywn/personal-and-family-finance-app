import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

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
import { normalizeToUTCDate } from "@/lib/utils"

describe("Budgets", async () => {
  const t = await getTranslations()

  describe("createBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
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
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockBudgetsCollection = setupBudgetCollectionMock()
      mockBudgetsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.budgetAddFailed"))
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
      expect(addedBudget?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(addedBudget?.endDate.toISOString()).toBe(
        "2024-01-31T00:00:00.000Z"
      )
      expect(result.success).toBe(t("budgets.be.budgetAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await createBudget(mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.budgetAddFailed"))
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
      expect(result.error).toBe(t("common.be.accessDenied"))
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
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget("invalid-id", mockValidBudgetValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.invalidBudgetId"))
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await updateBudget(
        mockBudget._id.toString(),
        mockValidBudgetValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.budgetNotFoundOrNoPermission"))
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
      expect(updatedBudget?.amount).toBe(2000000)
      expect(updatedBudget?.startDate.toISOString()).toBe(
        "2024-02-01T00:00:00.000Z"
      )
      expect(updatedBudget?.endDate.toISOString()).toBe(
        "2024-02-29T00:00:00.000Z"
      )
      expect(unrelatedBudget?.categoryKey).toBe("food_beverage")
      expect(unrelatedBudget?.amount).toBe(1000000)
      expect(unrelatedBudget?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(unrelatedBudget?.endDate.toISOString()).toBe(
        "2024-01-31T00:00:00.000Z"
      )
      expect(result.success).toBe(t("budgets.be.budgetUpdated"))
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
      expect(result.error).toBe(t("budgets.be.budgetUpdateFailed"))
    })
  })

  describe("deleteBudget", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid budget ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.invalidBudgetId"))
    })

    it("should return error when budget not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("budgets.be.budgetNotFoundOrNoPermissionDelete")
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
      expect(result.success).toBe(t("budgets.be.budgetDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await deleteBudget(mockBudget._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.budgetDeleteFailed"))
    })
  })

  describe("getBudgets", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getBudgets("", t)

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return empty budgets list", async () => {
      mockAuthenticatedUser()

      const result = await getBudgets(mockUser._id.toString(), t)

      expect(result.budgets).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return budgets list", async () => {
      await insertTestBudget(mockBudget)
      mockAuthenticatedUser()

      const result = await getBudgets(mockUser._id.toString(), t)

      expect(result.budgets).toHaveLength(1)
      expect(result.budgets?.[0].categoryKey).toBe("food_beverage")
      expect(result.budgets?.[0].amount).toBe(1000000)
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockBudgetCollectionError()

      const result = await getBudgets(mockUser._id.toString(), t)

      expect(result.budgets).toBeUndefined()
      expect(result.error).toBe(t("budgets.be.budgetFetchFailed"))
    })
  })
})
