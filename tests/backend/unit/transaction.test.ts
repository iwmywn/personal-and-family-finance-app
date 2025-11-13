import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { insertTestTransaction } from "@/tests/backend/helpers/database"
import {
  mockTransactionCollectionError,
  setupTransactionCollectionMock,
} from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockTransaction,
  mockUser,
  mockValidTransactionValues,
} from "@/tests/shared/data"
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/actions/transaction.actions"
import { getTransactionsCollection } from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"

describe("Transactions", async () => {
  const t = await getTranslations()

  describe("createTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction({
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        date: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockTransactionsCollection = setupTransactionCollectionMock()
      mockTransactionsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.transactionAddFailed"))
    })

    it("should successfully create transaction", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction(mockValidTransactionValues)
      const transactionsCollection = await getTransactionsCollection()
      const addedTransaction = await transactionsCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedTransaction?.type).toBe("income")
      expect(addedTransaction?.categoryKey).toBe("business_freelance")
      expect(addedTransaction?.amount).toBe(2500000)
      expect(addedTransaction?.description).toBe("Dự án thiết kế web")
      expect(addedTransaction?.date.toISOString()).toBe(
        "2024-02-05T00:00:00.000Z"
      )
      expect(result.success).toBe(t("transactions.be.transactionAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.transactionAddFailed"))
    })
  })

  describe("updateTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        date: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        "invalid-id",
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.invalidTransactionId"))
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("transactions.be.transactionNotFoundOrNoPermission")
      )
    })

    it("should successfully update transaction", async () => {
      await Promise.all([
        insertTestTransaction(mockTransaction),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "expense",
        categoryKey: "personal_care",
        amount: 100000,
        description: "Updated description",
        date: normalizeToUTCDate(new Date("2024-02-04")),
      })
      const transactionsCollection = await getTransactionsCollection()
      const updatedTransaction = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })
      const unrelatedTransaction = await transactionsCollection.findOne({
        _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
      })

      expect(updatedTransaction?.type).toBe("expense")
      expect(updatedTransaction?.categoryKey).toBe("personal_care")
      expect(updatedTransaction?.amount).toBe(100000)
      expect(updatedTransaction?.description).toBe("Updated description")
      expect(updatedTransaction?.date.toISOString()).toBe(
        "2024-02-04T00:00:00.000Z"
      )
      expect(unrelatedTransaction?.type).toBe("expense")
      expect(unrelatedTransaction?.categoryKey).toBe("food_beverage")
      expect(unrelatedTransaction?.amount).toBe(50000)
      expect(unrelatedTransaction?.description).toBe("nước dừa")
      expect(result.success).toBe(t("transactions.be.transactionUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.transactionUpdateFailed"))
    })
  })

  describe("deleteTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.invalidTransactionId"))
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("transactions.be.transactionNotFoundOrNoPermissionDelete")
      )
    })

    it("should successfully delete transaction", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const result = await deleteTransaction(mockTransaction._id.toString())
      const transactionsCollection = await getTransactionsCollection()
      const deletedTransaction = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })

      expect(deletedTransaction).toBe(null)
      expect(result.success).toBe(t("transactions.be.transactionDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.transactionDeleteFailed"))
    })
  })

  describe("getTransactions", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getTransactions("", t)

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return empty transactions list", async () => {
      mockAuthenticatedUser()

      const result = await getTransactions(mockUser._id.toString(), t)

      expect(result.transactions).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return transactions list", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const result = await getTransactions(mockUser._id.toString(), t)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions?.[0].description).toBe("nước dừa")
      expect(result.transactions?.[0].amount).toBe(50000)
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await getTransactions(mockUser._id.toString(), t)

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(t("transactions.be.transactionFetchFailed"))
    })
  })
})
