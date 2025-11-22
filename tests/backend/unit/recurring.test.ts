import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { insertTestRecurringTransaction } from "@/tests/backend/helpers/database"
import {
  mockRecurringTransactionCollectionError,
  setupRecurringTransactionCollectionMock,
} from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockRecurringTransaction,
  mockUser,
  mockValidRecurringTransactionValues,
} from "@/tests/shared/data"
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  updateRecurringTransaction,
} from "@/actions/recurring.actions"
import { getRecurringTransactionsCollection } from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"

describe("Recurring Transactions", async () => {
  const t = await getTranslations()

  beforeEach(() => {
    // mock time to 2024-06-01 to ensure endDate 2024-12-31 is in the future
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-06-01T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("createRecurringTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createRecurringTransaction(
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createRecurringTransaction({
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frequency: "invalid" as any,
        startDate: new Date("invalid"),
        isActive: true,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when recurring transaction already exists", async () => {
      await insertTestRecurringTransaction(mockRecurringTransaction)
      mockAuthenticatedUser()

      const result = await createRecurringTransaction({
        type: mockRecurringTransaction.type,
        categoryKey: mockRecurringTransaction.categoryKey,
        amount: mockRecurringTransaction.amount,
        description: mockRecurringTransaction.description,
        frequency: mockRecurringTransaction.frequency,
        randomEveryXDays: mockRecurringTransaction.randomEveryXDays,
        startDate: mockRecurringTransaction.startDate,
        endDate: mockRecurringTransaction.endDate,
        isActive: mockRecurringTransaction.isActive,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringExists"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockRecurringCollection = setupRecurringTransactionCollectionMock()
      mockRecurringCollection.findOne.mockResolvedValue(null)
      mockRecurringCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createRecurringTransaction(
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringAddFailed"))
    })

    it("should successfully create recurring transaction with monthly frequency", async () => {
      mockAuthenticatedUser()

      const result = await createRecurringTransaction(
        mockValidRecurringTransactionValues
      )
      const recurringCollection = await getRecurringTransactionsCollection()
      const addedRecurring = await recurringCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedRecurring?.type).toBe("income")
      expect(addedRecurring?.categoryKey).toBe("business_freelance")
      expect(addedRecurring?.amount).toBe(2500000)
      expect(addedRecurring?.description).toBe("Freelance project payment")
      expect(addedRecurring?.frequency).toBe("monthly")
      expect(addedRecurring?.startDate.toISOString()).toBe(
        "2024-02-01T00:00:00.000Z"
      )
      expect(addedRecurring?.endDate?.toISOString()).toBe(
        "2024-12-31T00:00:00.000Z"
      )
      expect(addedRecurring?.isActive).toBe(true)
      expect(result.success).toBe(t("recurring.be.recurringAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should successfully create recurring transaction with weekly frequency", async () => {
      mockAuthenticatedUser()

      const result = await createRecurringTransaction({
        ...mockValidRecurringTransactionValues,
        frequency: "weekly",
      })
      const recurringCollection = await getRecurringTransactionsCollection()
      const addedRecurring = await recurringCollection.findOne({
        userId: mockUser._id,
        frequency: "weekly",
      })

      expect(addedRecurring?.frequency).toBe("weekly")
      expect(result.success).toBe(t("recurring.be.recurringAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should successfully create recurring transaction with bi-weekly frequency", async () => {
      mockAuthenticatedUser()

      const result = await createRecurringTransaction({
        ...mockValidRecurringTransactionValues,
        frequency: "bi-weekly",
      })
      const recurringCollection = await getRecurringTransactionsCollection()
      const addedRecurring = await recurringCollection.findOne({
        userId: mockUser._id,
        frequency: "bi-weekly",
      })

      expect(addedRecurring?.frequency).toBe("bi-weekly")
      expect(result.success).toBe(t("recurring.be.recurringAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should successfully create recurring transaction with random frequency", async () => {
      mockAuthenticatedUser()

      const result = await createRecurringTransaction({
        ...mockValidRecurringTransactionValues,
        frequency: "random",
        randomEveryXDays: 3,
      })
      const recurringCollection = await getRecurringTransactionsCollection()
      const addedRecurring = await recurringCollection.findOne({
        userId: mockUser._id,
        frequency: "random",
      })

      expect(addedRecurring?.frequency).toBe("random")
      expect(addedRecurring?.randomEveryXDays).toBe(3)
      expect(result.success).toBe(t("recurring.be.recurringAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockRecurringTransactionCollectionError()

      const result = await createRecurringTransaction(
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringAddFailed"))
    })
  })

  describe("updateRecurringTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateRecurringTransaction(
        mockRecurringTransaction._id.toString(),
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateRecurringTransaction(
        mockRecurringTransaction._id.toString(),
        {
          type: "invalid" as "income" | "expense",
          categoryKey: "",
          amount: -1,
          description: "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          frequency: "invalid" as any,
          startDate: new Date("invalid"),
          isActive: true,
        }
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error with invalid recurring ID", async () => {
      mockAuthenticatedUser()

      const result = await updateRecurringTransaction(
        "invalid-id",
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.invalidRecurringId"))
    })

    it("should return error when recurring transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await updateRecurringTransaction(
        mockRecurringTransaction._id.toString(),
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("recurring.be.recurringNotFoundOrNoPermission")
      )
    })

    it("should successfully update recurring transaction", async () => {
      await Promise.all([
        insertTestRecurringTransaction(mockRecurringTransaction),
        insertTestRecurringTransaction({
          ...mockRecurringTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateRecurringTransaction(
        mockRecurringTransaction._id.toString(),
        {
          type: "expense",
          categoryKey: "food_beverage",
          amount: 100000,
          description: "Updated description",
          frequency: "weekly",
          randomEveryXDays: undefined,
          startDate: normalizeToUTCDate(new Date("2024-02-04")),
          endDate: normalizeToUTCDate(new Date("2024-12-31")),
          isActive: false,
        }
      )
      const recurringCollection = await getRecurringTransactionsCollection()
      const updatedRecurring = await recurringCollection.findOne({
        _id: mockRecurringTransaction._id,
      })
      const unrelatedRecurring = await recurringCollection.findOne({
        _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
      })

      expect(updatedRecurring?.type).toBe("expense")
      expect(updatedRecurring?.categoryKey).toBe("food_beverage")
      expect(updatedRecurring?.amount).toBe(100000)
      expect(updatedRecurring?.description).toBe("Updated description")
      expect(updatedRecurring?.frequency).toBe("weekly")
      expect(updatedRecurring?.startDate.toISOString()).toBe(
        "2024-02-04T00:00:00.000Z"
      )
      expect(updatedRecurring?.endDate?.toISOString()).toBe(
        "2024-12-31T00:00:00.000Z"
      )
      expect(updatedRecurring?.isActive).toBe(false)
      expect(unrelatedRecurring?.type).toBe("income")
      expect(unrelatedRecurring?.categoryKey).toBe("salary_bonus")
      expect(unrelatedRecurring?.amount).toBe(5000000)
      expect(result.success).toBe(t("recurring.be.recurringUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockRecurringTransactionCollectionError()

      const result = await updateRecurringTransaction(
        mockRecurringTransaction._id.toString(),
        mockValidRecurringTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringUpdateFailed"))
    })
  })

  describe("deleteRecurringTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteRecurringTransaction(
        mockRecurringTransaction._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid recurring ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteRecurringTransaction("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.invalidRecurringId"))
    })

    it("should return error when recurring transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteRecurringTransaction(
        mockRecurringTransaction._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("recurring.be.recurringNotFoundOrNoPermissionDelete")
      )
    })

    it("should successfully delete recurring transaction", async () => {
      await insertTestRecurringTransaction(mockRecurringTransaction)
      mockAuthenticatedUser()

      const result = await deleteRecurringTransaction(
        mockRecurringTransaction._id.toString()
      )
      const recurringCollection = await getRecurringTransactionsCollection()
      const deletedRecurring = await recurringCollection.findOne({
        _id: mockRecurringTransaction._id,
      })

      expect(deletedRecurring).toBe(null)
      expect(result.success).toBe(t("recurring.be.recurringDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockRecurringTransactionCollectionError()

      const result = await deleteRecurringTransaction(
        mockRecurringTransaction._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringDeleteFailed"))
    })
  })

  describe("getRecurringTransactions", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getRecurringTransactions("", t)

      expect(result.recurringTransactions).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return empty recurring transactions list", async () => {
      mockAuthenticatedUser()

      const result = await getRecurringTransactions(mockUser._id.toString(), t)

      expect(result.recurringTransactions).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return recurring transactions list", async () => {
      await insertTestRecurringTransaction(mockRecurringTransaction)
      mockAuthenticatedUser()

      const result = await getRecurringTransactions(mockUser._id.toString(), t)

      expect(result.recurringTransactions).toHaveLength(1)
      expect(result.recurringTransactions?.[0].description).toBe(
        "Monthly Salary"
      )
      expect(result.recurringTransactions?.[0].amount).toBe(5000000)
      expect(result.error).toBeUndefined()
    })

    it("should return recurring transactions sorted by startDate and _id descending", async () => {
      const recurring1 = {
        ...mockRecurringTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8106"),
        startDate: normalizeToUTCDate(new Date("2024-01-15")),
      }
      const recurring2 = {
        ...mockRecurringTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8107"),
        startDate: normalizeToUTCDate(new Date("2024-01-15")),
      }
      const recurring3 = {
        ...mockRecurringTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8108"),
        startDate: normalizeToUTCDate(new Date("2024-02-15")),
      }

      await Promise.all([
        insertTestRecurringTransaction(recurring1),
        insertTestRecurringTransaction(recurring2),
        insertTestRecurringTransaction(recurring3),
      ])
      mockAuthenticatedUser()

      const result = await getRecurringTransactions(mockUser._id.toString(), t)

      expect(result.recurringTransactions).toHaveLength(3)
      // Should be sorted by startDate descending, then _id descending
      expect(result.recurringTransactions?.[0].startDate.toISOString()).toBe(
        "2024-02-15T00:00:00.000Z"
      )
      expect(result.recurringTransactions?.[1]._id).toBe(
        "68f73357357d93dcbaae8107"
      )
      expect(result.recurringTransactions?.[2]._id).toBe(
        "68f73357357d93dcbaae8106"
      )
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockRecurringTransactionCollectionError()

      const result = await getRecurringTransactions(mockUser._id.toString(), t)

      expect(result.recurringTransactions).toBeUndefined()
      expect(result.error).toBe(t("recurring.be.recurringFetchFailed"))
    })
  })
})
