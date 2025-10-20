import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/actions/transactions"

import { insertTestTransaction } from "../helpers/database"
import {
  createTestTransaction,
  testUserId,
  validTransactionValues,
} from "../helpers/test-data"
import {
  clearMockSession,
  createMockSession,
  mockSession,
} from "../mocks/session.mock"

vi.mock("@/lib/session", () => ({ session: mockSession }))

describe("Transactions Actions", () => {
  beforeEach(() => {
    clearMockSession()
    vi.clearAllMocks()
  })

  describe("createTransaction", () => {
    it("should create transaction successfully", async () => {
      createMockSession(testUserId)

      const result = await createTransaction(validTransactionValues)

      expect(result.success).toBe("Giao dịch đã được tạo.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await createTransaction(validTransactionValues)

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      createMockSession(testUserId)

      const result = await createTransaction({
        type: "invalid" as "expense" | "income",
        categoryKey: "",
        amount: -100,
        description: "",
        date: new Date(),
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should validate amount range", async () => {
      createMockSession(testUserId)

      const result = await createTransaction({
        ...validTransactionValues,
        amount: 0, // Below minimum
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should validate description length", async () => {
      createMockSession(testUserId)

      const result = await createTransaction({
        ...validTransactionValues,
        description: "a".repeat(201), // Exceeds max length
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })
  })

  describe("updateTransaction", () => {
    it("should update transaction successfully", async () => {
      createMockSession(testUserId)
      const transaction = createTestTransaction(testUserId)
      const transactionId = await insertTestTransaction(transaction)

      const result = await updateTransaction(transactionId, {
        ...validTransactionValues,
        amount: 100000,
      })

      expect(result.success).toBe("Giao dịch đã được cập nhật.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when transaction not found", async () => {
      createMockSession(testUserId)

      const result = await updateTransaction(
        "invalid-id",
        validTransactionValues
      )

      expect(result.error).toContain("Không tìm thấy giao dịch")
    })

    it("should prevent unauthorized updates", async () => {
      createMockSession(testUserId)
      const transaction = createTestTransaction(testUserId)
      const transactionId = await insertTestTransaction(transaction)

      // Try to update with different user
      createMockSession("different-user-id")

      const result = await updateTransaction(
        transactionId,
        validTransactionValues
      )

      expect(result.error).toContain("Không tìm thấy giao dịch")
    })
  })

  describe("deleteTransaction", () => {
    it("should delete transaction successfully", async () => {
      createMockSession(testUserId)
      const transaction = createTestTransaction(testUserId)
      const transactionId = await insertTestTransaction(transaction)

      const result = await deleteTransaction(transactionId)

      expect(result.success).toBe("Giao dịch đã được xóa.")
    })

    it("should return error when transaction not found", async () => {
      createMockSession(testUserId)

      const result = await deleteTransaction("invalid-id")

      expect(result.error).toContain("Không tìm thấy giao dịch")
    })

    it("should prevent unauthorized deletion", async () => {
      createMockSession(testUserId)
      const transaction = createTestTransaction(testUserId)
      const transactionId = await insertTestTransaction(transaction)

      // Try to delete with different user
      createMockSession("different-user-id")

      const result = await deleteTransaction(transactionId)

      expect(result.error).toContain("Không tìm thấy giao dịch")
    })
  })

  describe("getTransactions", () => {
    it("should return all user transactions", async () => {
      createMockSession(testUserId)
      const transaction1 = createTestTransaction(testUserId)
      const transaction2 = createTestTransaction(testUserId)
      transaction2.amount = 100000

      await insertTestTransaction(transaction1)
      await insertTestTransaction(transaction2)

      const result = await getTransactions()

      expect(result.transactions).toHaveLength(2)
      expect(result.error).toBeUndefined()
    })

    it("should return transactions sorted by date descending", async () => {
      createMockSession(testUserId)
      const transaction1 = createTestTransaction(testUserId)
      const transaction2 = createTestTransaction(testUserId)
      transaction2.date = new Date("2024-01-25")

      await insertTestTransaction(transaction1)
      await insertTestTransaction(transaction2)

      const result = await getTransactions()

      expect(result.transactions?.[0].date).toEqual(transaction2.date)
      expect(result.transactions?.[1].date).toEqual(transaction1.date)
    })

    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await getTransactions()

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })
  })
})
