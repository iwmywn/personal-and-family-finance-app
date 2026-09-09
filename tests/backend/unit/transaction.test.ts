import { ObjectId } from "mongodb"

import { insertTestTransaction } from "@/tests/backend/helpers/database"
import { mockTransactionCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedAsAnotherUser,
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
import { localDateToUTCMidnight } from "@/lib/utils"

describe("Transactions", async () => {
  describe("createTransaction", () => {
    it("should return error when data is invalid", async () => {
      // @ts-expect-error - Testing invalid data
      const result = await createTransaction({})

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid data!")
    })

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
      expect(duplicateResult.error).toBe("This transaction already exists!")
    })

    it("should successfully create transaction", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction(mockValidTransactionValues)
      const transactionsCollection = await getTransactionsCollection()
      const addedTransaction = await transactionsCollection.findOne({
        userId: mockUser._id,
      })

      expect(addedTransaction?.type).toBe("inflow")
      expect(addedTransaction?.categoryKey).toBe("business_freelance")
      expect(addedTransaction?.amount.toString()).toBe("2500000")
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

    it("should return error and not save transaction when fetching exchange rate fails", async () => {
      mockAuthenticatedUser()
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response)

      const testDate = localDateToUTCMidnight(new Date("2026-03-01"))
      const result = await createTransaction({
        ...mockValidTransactionValues,
        date: testDate,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to add transaction! Please try again later."
      )

      const transactionsCollection = await getTransactionsCollection()
      const found = await transactionsCollection.findOne({
        date: testDate,
      })
      expect(found).toBeNull()

      fetchSpy.mockRestore()
    })

    it("should prevent race condition when creating duplicate transactions concurrently", async () => {
      mockAuthenticatedUser()

      const [firstResult, secondResult] = await Promise.all([
        createTransaction(mockValidTransactionValues),
        createTransaction(mockValidTransactionValues),
      ])

      const results = [firstResult, secondResult]
      const successCount = results.filter(
        (r) => r.success === "Transaction has been added."
      ).length
      const errorCount = results.filter(
        (r) => r.error === "This transaction already exists!"
      ).length

      expect(successCount).toBe(1)
      expect(errorCount).toBe(1)
    })

    it("should return error when categoryKey is invalid or does not belong to user", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction({
        ...mockValidTransactionValues,
        categoryKey: "non-existent-or-invalid-key",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid category!")
    })

    it("should return error when transaction type does not match category type", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction({
        ...mockValidTransactionValues,
        type: "outflow",
        categoryKey: "business_freelance",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid category!")
    })
  })

  describe("updateTransaction", () => {
    it("should return error when data is invalid", async () => {
      // @ts-expect-error - Testing invalid data
      const result = await updateTransaction(mockTransaction._id.toString(), {})

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid data!")
    })

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

    it("should return error when another user tries to update", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedAsAnotherUser()

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "outflow",
        categoryKey: "personal_care",
        amount: "100000",
        currency: "VND",
        description: "Hacked description",
        date: localDateToUTCMidnight(new Date("2024-02-04")),
      })
      const transactionsCollection = await getTransactionsCollection()
      const unchangedTransaction = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Transaction not found or you don't have permission to edit!"
      )
      expect(unchangedTransaction?.description).toBe("hamburger")
    })

    it("should successfully update transaction", async () => {
      await Promise.all([
        insertTestTransaction(mockTransaction),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
          description: "pizza",
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "outflow",
        categoryKey: "personal_care",
        amount: "100000",
        currency: "VND",
        description: "Updated description",
        date: localDateToUTCMidnight(new Date("2024-02-04")),
      })
      const transactionsCollection = await getTransactionsCollection()
      const updatedTransaction = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })
      const unrelatedTransaction = await transactionsCollection.findOne({
        _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
      })

      expect(updatedTransaction?.type).toBe("outflow")
      expect(updatedTransaction?.categoryKey).toBe("personal_care")
      expect(updatedTransaction?.amount.toString()).toBe("100000")
      expect(updatedTransaction?.description).toBe("Updated description")
      expect(updatedTransaction?.date.toISOString()).toBe(
        "2024-02-04T00:00:00.000Z"
      )
      expect(unrelatedTransaction?.type).toBe("outflow")
      expect(unrelatedTransaction?.categoryKey).toBe("food_beverage")
      expect(unrelatedTransaction?.amount.toString()).toBe("50000")
      expect(unrelatedTransaction?.description).toBe("pizza")
      expect(result.success).toBe("Transaction has been updated.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when updating transaction causes duplicate key collision", async () => {
      await Promise.all([
        insertTestTransaction(mockTransaction),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
          description: "pizza",
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateTransaction("690d2e5f7d5c36bf6c82ff1f", {
        type: mockTransaction.type,
        categoryKey: mockTransaction.categoryKey,
        amount: mockTransaction.amount.toString(),
        currency: mockTransaction.currency,
        description: mockTransaction.description,
        date: mockTransaction.date,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("This transaction already exists!")
    })

    it("should prevent race condition when updating duplicate transactions concurrently", async () => {
      await Promise.all([
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1e"),
          description: "pizza 1",
        }),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("690d2e5f7d5c36bf6c82ff1f"),
          description: "pizza 2",
        }),
      ])
      mockAuthenticatedUser()

      const targetValues = {
        type: mockTransaction.type,
        categoryKey: mockTransaction.categoryKey,
        amount: mockTransaction.amount.toString(),
        currency: mockTransaction.currency,
        description: "target pizza",
        date: mockTransaction.date,
      }

      const [firstResult, secondResult] = await Promise.all([
        updateTransaction("690d2e5f7d5c36bf6c82ff1e", targetValues),
        updateTransaction("690d2e5f7d5c36bf6c82ff1f", targetValues),
      ])

      const results = [firstResult, secondResult]
      const successCount = results.filter(
        (r) => r.success === "Transaction has been updated."
      ).length
      const errorCount = results.filter(
        (r) => r.error === "This transaction already exists!"
      ).length

      expect(successCount).toBe(1)
      expect(errorCount).toBe(1)
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

    it("should return error and not update transaction when fetching exchange rate fails", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response)

      const newDate = localDateToUTCMidnight(new Date("2026-03-01"))
      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: mockTransaction.type,
        categoryKey: mockTransaction.categoryKey,
        amount: mockTransaction.amount.toString(),
        currency: mockTransaction.currency,
        description: "attempted new description",
        date: newDate,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to update transaction! Please try again later."
      )

      const transactionsCollection = await getTransactionsCollection()
      const current = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })
      expect(current?.description).toBe(mockTransaction.description)
      expect(current?.date.toISOString()).toBe(
        mockTransaction.date.toISOString()
      )

      fetchSpy.mockRestore()
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

    it("should return error when another user tries to delete", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedAsAnotherUser()

      const result = await deleteTransaction(mockTransaction._id.toString())
      const transactionsCollection = await getTransactionsCollection()
      const unchangedTransaction = await transactionsCollection.findOne({
        _id: mockTransaction._id,
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Transaction not found or you don't have permission to delete!"
      )
      expect(unchangedTransaction).not.toBe(null)
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

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return empty transactions list", async () => {
      mockAuthenticatedUser()

      const result = await getTransactions()

      expect(result.transactions).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return transactions list", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const result = await getTransactions()

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions?.[0].description).toBe("hamburger")
      expect(result.transactions?.[0].amount).toBe("50000")
      expect(result.error).toBeUndefined()
    })

    it("should return transactions sorted by date and _id descending", async () => {
      const transaction1 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8106"),
        description: "hamburger 1",
        date: localDateToUTCMidnight(new Date("2024-01-15")),
      }
      const transaction2 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8107"),
        description: "hamburger 2",
        date: localDateToUTCMidnight(new Date("2024-01-15")),
      }
      const transaction3 = {
        ...mockTransaction,
        _id: new ObjectId("68f73357357d93dcbaae8108"),
        description: "hamburger 3",
        date: localDateToUTCMidnight(new Date("2024-02-15")),
      }

      await Promise.all([
        insertTestTransaction(transaction1),
        insertTestTransaction(transaction2),
        insertTestTransaction(transaction3),
      ])
      mockAuthenticatedUser()

      const result = await getTransactions()

      expect(result.transactions).toHaveLength(3)
      // Should be sorted by date descendinghen _id descending
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

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Failed to load transactions! Please try again later."
      )
    })
  })
})
