import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { insertTestGoal } from "@/tests/backend/helpers/database"
import {
  mockGoalCollectionError,
  setupGoalCollectionMock,
} from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockGoal, mockUser, mockValidGoalValues } from "@/tests/shared/data"
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "@/actions/goal.actions"
import { getGoalsCollection } from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"

describe("Goals", async () => {
  const t = await getTranslations()

  describe("createGoal", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createGoal(mockValidGoalValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createGoal({
        categoryKey: "",
        name: "",
        targetAmount: -1,
        startDate: new Date("invalid"),
        endDate: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when endDate is before startDate", async () => {
      mockAuthenticatedUser()

      const result = await createGoal({
        categoryKey: "food_beverage",
        name: "Valid",
        targetAmount: 1000000,
        startDate: normalizeToUTCDate(new Date("2024-12-31")),
        endDate: normalizeToUTCDate(new Date("2024-01-01")),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when budget already exists", async () => {
      await insertTestGoal(mockGoal)
      mockAuthenticatedUser()

      const result = await createGoal({
        categoryKey: mockGoal.categoryKey,
        name: "Valid",
        targetAmount: 2000000,
        startDate: normalizeToUTCDate(mockGoal.startDate),
        endDate: normalizeToUTCDate(mockGoal.endDate),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalExists"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockGoalsCollection = setupGoalCollectionMock()
      mockGoalsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createGoal(mockValidGoalValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalAddFailed"))
    })

    it("should successfully create goal", async () => {
      mockAuthenticatedUser()

      const result = await createGoal(mockValidGoalValues)
      const goalsCollection = await getGoalsCollection()
      const addedGoal = await goalsCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedGoal?.categoryKey).toBe("food_beverage")
      expect(addedGoal?.name).toBe("Mua xe máy")
      expect(addedGoal?.targetAmount).toBe(50000000)
      expect(addedGoal?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(addedGoal?.endDate.toISOString()).toBe("2024-12-31T00:00:00.000Z")
      expect(result.success).toBe(t("goals.be.goalAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockGoalCollectionError()

      const result = await createGoal(mockValidGoalValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalAddFailed"))
    })
  })

  describe("updateGoal", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateGoal(
        mockGoal._id.toString(),
        mockValidGoalValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateGoal(mockGoal._id.toString(), {
        categoryKey: "",
        name: "",
        targetAmount: -1,
        startDate: new Date("invalid"),
        endDate: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error with invalid goal ID", async () => {
      mockAuthenticatedUser()

      const result = await updateGoal("invalid-id", mockValidGoalValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.invalidGoalId"))
    })

    it("should return error when goal not found", async () => {
      mockAuthenticatedUser()

      const result = await updateGoal(
        mockGoal._id.toString(),
        mockValidGoalValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalNotFoundOrNoPermission"))
    })

    it("should successfully update goal", async () => {
      await Promise.all([
        insertTestGoal(mockGoal),
        insertTestGoal({
          ...mockGoal,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateGoal(mockGoal._id.toString(), {
        categoryKey: "housing",
        name: "Mua nhà",
        targetAmount: 2000000000,
        startDate: normalizeToUTCDate(new Date("2024-01-01")),
        endDate: normalizeToUTCDate(new Date("2025-12-31")),
      })
      const goalsCollection = await getGoalsCollection()
      const updatedGoal = await goalsCollection.findOne({
        _id: mockGoal._id,
      })
      const unrelatedGoal = await goalsCollection.findOne({
        _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
      })

      expect(updatedGoal?.categoryKey).toBe("housing")
      expect(updatedGoal?.name).toBe("Mua nhà")
      expect(updatedGoal?.targetAmount).toBe(2000000000)
      expect(updatedGoal?.startDate.toISOString()).toBe(
        "2024-01-01T00:00:00.000Z"
      )
      expect(updatedGoal?.endDate.toISOString()).toBe(
        "2025-12-31T00:00:00.000Z"
      )
      expect(unrelatedGoal?.categoryKey).toBe("food_beverage")
      expect(unrelatedGoal?.name).toBe("Mua xe máy")
      expect(result.success).toBe(t("goals.be.goalUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockGoalCollectionError()

      const result = await updateGoal(
        mockGoal._id.toString(),
        mockValidGoalValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalUpdateFailed"))
    })
  })

  describe("deleteGoal", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteGoal(mockGoal._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid goal ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteGoal("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.invalidGoalId"))
    })

    it("should return error when goal not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteGoal(mockGoal._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalNotFoundOrNoPermissionDelete"))
    })

    it("should successfully delete goal", async () => {
      await insertTestGoal(mockGoal)
      mockAuthenticatedUser()

      const result = await deleteGoal(mockGoal._id.toString())
      const goalsCollection = await getGoalsCollection()
      const deletedGoal = await goalsCollection.findOne({
        _id: mockGoal._id,
      })

      expect(deletedGoal).toBe(null)
      expect(result.success).toBe(t("goals.be.goalDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockGoalCollectionError()

      const result = await deleteGoal(mockGoal._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalDeleteFailed"))
    })
  })

  describe("getGoals", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getGoals("", t)

      expect(result.goals).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return empty goals list", async () => {
      mockAuthenticatedUser()

      const result = await getGoals(mockUser._id.toString(), t)

      expect(result.goals).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return goals list", async () => {
      await insertTestGoal(mockGoal)
      mockAuthenticatedUser()

      const result = await getGoals(mockUser._id.toString(), t)

      expect(result.goals).toHaveLength(1)
      expect(result.goals?.[0].name).toBe("Mua xe máy")
      expect(result.goals?.[0].targetAmount).toBe(50000000)
      expect(result.goals?.[0].categoryKey).toBe("food_beverage")
      expect(result.error).toBeUndefined()
    })

    it("should return goals sorted by startDate and _id descending", async () => {
      const goal1 = {
        ...mockGoal,
        _id: new ObjectId("68f896e5cda4897217a05a2d"),
        startDate: normalizeToUTCDate(new Date("2024-01-01")),
      }
      const goal2 = {
        ...mockGoal,
        _id: new ObjectId("68f896e5cda4897217a05a2e"),
        startDate: normalizeToUTCDate(new Date("2024-01-01")),
      }
      const goal3 = {
        ...mockGoal,
        _id: new ObjectId("68f896e5cda4897217a05a2f"),
        startDate: normalizeToUTCDate(new Date("2024-02-01")),
      }

      await Promise.all([
        insertTestGoal(goal1),
        insertTestGoal(goal2),
        insertTestGoal(goal3),
      ])
      mockAuthenticatedUser()

      const result = await getGoals(mockUser._id.toString(), t)

      expect(result.goals).toHaveLength(3)
      // Should be sorted by startDate descending, then _id descending
      expect(result.goals?.[0].startDate.toISOString()).toBe(
        "2024-02-01T00:00:00.000Z"
      )
      expect(result.goals?.[1]._id).toBe("68f896e5cda4897217a05a2e")
      expect(result.goals?.[2]._id).toBe("68f896e5cda4897217a05a2d")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockGoalCollectionError()

      const result = await getGoals(mockUser._id.toString(), t)

      expect(result.goals).toBeUndefined()
      expect(result.error).toBe(t("goals.be.goalFetchFailed"))
    })
  })
})
