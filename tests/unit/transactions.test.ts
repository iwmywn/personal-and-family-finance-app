import { insertTestTransaction } from "@/tests/helpers/database"
import { transaction, validTransactionValues } from "@/tests/helpers/test-data"
import {
  mockTransactionCollectionError,
  setupTransactionCollectionMock,
} from "@/tests/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/mocks/session.mock"
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

      const result = await createTransaction(validTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
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
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockTransactionsCollection = setupTransactionCollectionMock()
      mockTransactionsCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createTransaction(validTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Tạo giao dịch thất bại! Thử lại sau.")
    })

    it("should successfully create transaction", async () => {
      mockAuthenticatedUser()

      const result = await createTransaction(validTransactionValues)

      expect(result.success).toBe("Giao dịch đã được tạo.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await createTransaction(validTransactionValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Tạo giao dịch thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("updateTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateTransaction(
        transaction._id.toString(),
        validTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(transaction._id.toString(), {
        type: "invalid" as "income" | "expense",
        categoryKey: "",
        amount: -1,
        description: "",
        date: new Date("invalid"),
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        "invalid-id",
        validTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Transaction ID không hợp lệ!")
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await updateTransaction(
        transaction._id.toString(),
        validTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không tìm thấy giao dịch hoặc bạn không có quyền chỉnh sửa!"
      )
    })

    it("should successfully update transaction", async () => {
      await insertTestTransaction(transaction)
      mockAuthenticatedUser()

      const result = await updateTransaction(transaction._id.toString(), {
        type: "income",
        categoryKey: "personal_care",
        amount: 100000,
        description: "Updated description",
        date: new Date("2024-01-16"),
      })

      expect(result.success).toBe("Giao dịch đã được cập nhật.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await updateTransaction(
        transaction._id.toString(),
        validTransactionValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Cập nhật giao dịch thất bại! Vui lòng thử lại sau."
      )
    })
  })

  describe("deleteTransaction", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteTransaction(transaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid transaction ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Transaction ID không hợp lệ!")
    })

    it("should return error when transaction not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteTransaction(transaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không tìm thấy giao dịch hoặc bạn không có quyền xóa!"
      )
    })

    it("should successfully delete transaction", async () => {
      await insertTestTransaction(transaction)
      mockAuthenticatedUser()

      const result = await deleteTransaction(transaction._id.toString())

      expect(result.success).toBe("Giao dịch đã được xóa.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await deleteTransaction(transaction._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Xóa giao dịch thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("getTransactions", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return empty transactions list", async () => {
      mockAuthenticatedUser()

      const result = await getTransactions()

      expect(result.transactions).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return transactions list", async () => {
      await insertTestTransaction(transaction)
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

      const result = await getTransactions()

      expect(result.transactions).toBeUndefined()
      expect(result.error).toBe(
        "Tải danh sách giao dịch thất bại! Vui lòng thử lại sau."
      )
    })
  })
})
