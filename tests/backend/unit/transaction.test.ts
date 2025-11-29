import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

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
  const t = await getExtracted()

  describe("createTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error when creating duplicate transaction on the same day", async () => {
      mockAuthenticatedUser()

      const firstResult = await createTransaction(mockValidTransactionValues)
      const duplicateResult = await createTransaction(
        mockValidTransactionValues
      )

      expect(firstResult.success).toBe("Transaction has been added.")
      expect(firstResult.error).toBeUndefined()
      expect(duplicateResult.success).toBeUndefined()
      expect(duplicateResult.error).toBe(
        "This transaction has already been created today!"
      )
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockTransactionsCollection = setupTransactionCollectionMock()
      mockTransactionsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to add transaction! Please try again later."
      )
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
      expect(addedTransaction?.description).toBe("freelance project payment")
      expect(addedTransaction?.date.toISOString()).toBe(
        "2024-02-05T00:00:00.000Z"
      )
      expect(result.success).toBe("Transaction has been added.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to add transaction! Please try again later."
      )
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
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        "invalid-id",
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid transaction ID!")
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Transaction not found or you don't have permission to edit!"
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
      expect(unrelatedTransaction?.description).toBe("hamburger")
      expect(result.success).toBe("Transaction has been updated.")
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
      expect(result.error).toBe(
        "Failed to update transaction! Please try again later."
      )
    })
  })

  describe("deleteTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid transaction ID!")
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Transaction not found or you don't have permission to delete!"
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
      expect(result.success).toBe("Transaction has been deleted.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to delete transaction! Please try again later."
      )
    })
  })

  describe("getTransactions", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getTransactions("", t)

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
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
      expect(result.transactions?.[0].description).toBe("hamburger")
      expect(result.transactions?.[0].amount).toBe(50000)
      expect(result.error).toBeUndefined()
    })

    it("should return transactions sorted by date and _id descending", async () => {
      const transaction1 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8106"),
        date: normalizeToUTCDate(new Date("2024-01-15")),
      }
      const transaction2 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8107"),
        date: normalizeToUTCDate(new Date("2024-01-15")),
      }
      const transaction3 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8108"),
        date: normalizeToUTCDate(new Date("2024-02-15")),
      }

      await Promise.all([
        insertTestTransaction(transaction1),
        insertTestTransaction(transaction2),
        insertTestTransaction(transaction3),
      ])
      mockAuthenticatedUser()

      const result = await getTransactions(mockUser._id.toString(), t)

      expect(result.transactions).toHaveLength(3)
      // Should be sorted by date descending, then _id descending
      expect(result.transactions?.[0].date.toISOString()).toBe(
        "2024-02-15T00:00:00.000Z"
      )
      expect(result.transactions?.[1]._id).toBe("68f73357357d93dcbaae8107")
      expect(result.transactions?.[2]._id).toBe("68f73357357d93dcbaae8106")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await getTransactions(mockUser._id.toString(), t)

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Failed to load transactions! Please try again later."
      )
    })
  })
})
