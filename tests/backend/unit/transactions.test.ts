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
  mockValidTransactionValues,
} from "@/tests/shared/data"
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/actions/transactions"

describe("Transactions Actions", () => {
  describe("createTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await createTransaction({
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        date: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockTransactionsCollection = setupTransactionCollectionMock()
      mockTransactionsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("transactionAddFailed"))
    })

    it("should successfully create transaction", async () => {
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBe(tTransactionsBE("transactionAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await createTransaction(mockValidTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("transactionAddFailed"))
    })
  })

  describe("updateTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        date: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await updateTransaction(
        "invalid-id",
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("invalidTransactionId"))
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        tTransactionsBE("transactionNotFoundOrNoPermission")
      )
    })

    it("should successfully update transaction", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await updateTransaction(mockTransaction._id.toString(), {
        type: "income",
        categoryKey: "personal_care",
        amount: 100000,
        description: "Updated description",
        date: new Date("2024-01-16"),
      })

      expect(result.success).toBe(tTransactionsBE("transactionUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await updateTransaction(
        mockTransaction._id.toString(),
        mockValidTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("transactionUpdateFailed"))
    })
  })

  describe("deleteTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await deleteTransaction("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("invalidTransactionId"))
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        tTransactionsBE("transactionNotFoundOrNoPermissionDelete")
      )
    })

    it("should successfully delete transaction", async () => {
      await insertTestTransaction(mockTransaction)
      mockAuthenticatedUser()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBe(tTransactionsBE("transactionDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await deleteTransaction(mockTransaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("transactionDeleteFailed"))
    })
  })

  describe("getTransactions", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
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
      expect(result.transactions?.[0].description).toBe("nước dừa")
      expect(result.transactions?.[0].amount).toBe(50000)
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const tTransactionsBE = await getTranslations("transactions.be")

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(tTransactionsBE("transactionFetchFailed"))
    })
  })
})
