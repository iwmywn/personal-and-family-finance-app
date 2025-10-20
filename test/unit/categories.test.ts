import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createCustomCategory,
  deleteCustomCategory,
  getCustomCategories,
  updateCustomCategory,
} from "@/actions/categories"

import {
  countCategories,
  insertTestCategory,
  insertTestTransaction,
} from "../helpers/database"
import {
  createTestCategory,
  createTestTransaction,
  testUserId,
  validCategoryValues,
} from "../helpers/test-data"
import {
  clearMockSession,
  createMockSession,
  mockSession,
} from "../mocks/session.mock"

vi.mock("@/lib/session", () => ({ session: mockSession }))

describe("Categories Actions", () => {
  beforeEach(() => {
    clearMockSession()
    vi.clearAllMocks()
  })

  describe("createCustomCategory", () => {
    it("should create a custom category successfully", async () => {
      createMockSession(testUserId)

      const result = await createCustomCategory(validCategoryValues)

      expect(result.success).toBe("Danh mục đã được tạo.")
      expect(result.error).toBeUndefined()

      const count = await countCategories(testUserId)
      expect(count).toBe(1)
    })

    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await createCustomCategory(validCategoryValues)

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      createMockSession(testUserId)

      const result = await createCustomCategory({
        type: "invalid" as "expense" | "income",
        label: "",
        description: "",
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when category with same name exists", async () => {
      createMockSession(testUserId)
      const category = createTestCategory(testUserId)
      await insertTestCategory(category)

      const result = await createCustomCategory({
        type: "expense",
        label: "Entertainment",
        description: "Different description",
      })

      expect(result.error).toBe("Danh mục với tên này đã tồn tại!")
    })

    it("should validate category label length", async () => {
      createMockSession(testUserId)

      const result = await createCustomCategory({
        type: "expense",
        label: "a".repeat(51), // Exceeds max length
        description: "Valid description",
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })
  })

  describe("updateCustomCategory", () => {
    it("should update category successfully", async () => {
      createMockSession(testUserId)
      const category = createTestCategory(testUserId)
      const categoryId = await insertTestCategory(category)

      const result = await updateCustomCategory(categoryId, {
        type: "expense",
        label: "Updated Label",
        description: "Updated description",
      })

      expect(result.success).toBe("Danh mục đã được cập nhật.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when category not found", async () => {
      createMockSession(testUserId)

      const result = await updateCustomCategory(
        "invalid-id",
        validCategoryValues
      )

      expect(result.error).toContain("Không tìm thấy danh mục")
    })

    it("should prevent duplicate category names", async () => {
      createMockSession(testUserId)
      const category1 = createTestCategory(testUserId)
      const category2 = createTestCategory(testUserId)
      category2.label = "Different Label"

      const id1 = await insertTestCategory(category1)
      await insertTestCategory(category2)

      const result = await updateCustomCategory(id1, {
        type: "expense",
        label: "Different Label",
        description: "New description",
      })

      expect(result.error).toBe("Danh mục với tên này đã tồn tại!")
    })
  })

  describe("deleteCustomCategory", () => {
    it("should delete category successfully", async () => {
      createMockSession(testUserId)
      const category = createTestCategory(testUserId)
      const categoryId = await insertTestCategory(category)

      const result = await deleteCustomCategory(categoryId)

      expect(result.success).toBe("Danh mục đã được xóa.")
      const count = await countCategories(testUserId)
      expect(count).toBe(0)
    })

    it("should prevent deletion if transactions reference category", async () => {
      createMockSession(testUserId)
      const category = createTestCategory(testUserId)
      const categoryId = await insertTestCategory(category)

      const transaction = createTestTransaction(testUserId)
      transaction.categoryKey = category.categoryKey
      await insertTestTransaction(transaction)

      const result = await deleteCustomCategory(categoryId)

      expect(result.error).toContain("Không thể xóa danh mục")
      expect(result.error).toContain("1 giao dịch")
    })

    it("should return error when category not found", async () => {
      createMockSession(testUserId)

      const result = await deleteCustomCategory("invalid-id")

      expect(result.error).toContain("Không tìm thấy danh mục")
    })
  })

  describe("getCustomCategories", () => {
    it("should return all user categories", async () => {
      createMockSession(testUserId)
      const category1 = createTestCategory(testUserId)
      const category2 = createTestCategory(testUserId)
      category2.label = "Another Category"

      await insertTestCategory(category1)
      await insertTestCategory(category2)

      const result = await getCustomCategories()

      expect(result.categories).toHaveLength(2)
      expect(result.error).toBeUndefined()
    })

    it("should return empty array when no categories exist", async () => {
      createMockSession(testUserId)

      const result = await getCustomCategories()

      expect(result.categories).toHaveLength(0)
      expect(result.error).toBeUndefined()
    })

    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await getCustomCategories()

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })
  })
})
