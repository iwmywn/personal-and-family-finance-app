import { ObjectId } from "mongodb"

import {
  insertTestCategory,
  insertTestTransaction,
} from "@/tests/helpers/database"
import {
  category,
  transaction,
  validCategoryValues,
} from "@/tests/helpers/test-data"
import {
  mockCategoryCollectionError,
  mockTransactionCollectionError,
  setupCategoryCollectionMock,
} from "@/tests/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/mocks/session.mock"
import {
  createCustomCategory,
  deleteCustomCategory,
  getCustomCategories,
  updateCustomCategory,
} from "@/actions/categories"

describe("Categories Actions", () => {
  describe("createCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createCustomCategory(validCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createCustomCategory({
        type: "invalid" as "expense" | "income",
        label: "",
        description: "",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when category with same name exists", async () => {
      await insertTestCategory(category)
      mockAuthenticatedUser()

      const result = await createCustomCategory({
        type: category.type,
        label: category.label,
        description: "Different description",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Danh mục với tên này đã tồn tại!")
    })

    it("should return error when duplicate categoryKey exists", async () => {
      await insertTestCategory(category)
      mockAuthenticatedUser()

      vi.mock("nanoid", () => ({
        nanoid: () => "abcdef12",
      }))

      const result = await createCustomCategory({
        type: "expense",
        label: "Dupe Key",
        description: "desc",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Lỗi tạo key danh mục. Vui lòng thử lại.")
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockCategoriesCollection = setupCategoryCollectionMock()
      mockCategoriesCollection.findOne.mockResolvedValue(null)
      mockCategoriesCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createCustomCategory(validCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Tạo danh mục thất bại! Thử lại sau.")
    })

    it("should successfully create custom category", async () => {
      mockAuthenticatedUser()

      const result = await createCustomCategory(validCategoryValues)

      expect(result.success).toBe("Danh mục đã được tạo.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await createCustomCategory(validCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Tạo danh mục thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("updateCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateCustomCategory(
        category._id.toString(),
        validCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(category._id.toString(), {
        type: "invalid" as "expense" | "income",
        label: "",
        description: "",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        "invalid-id",
        validCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Category ID không hợp lệ!")
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        category._id.toString(),
        validCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không tìm thấy danh mục hoặc bạn không có quyền chỉnh sửa!"
      )
    })

    it("should return error when duplicate category name exists", async () => {
      await insertTestCategory(category)
      await insertTestCategory({
        ...category,
        _id: new ObjectId("68f795d4bdcc3c9a30717977"),
        label: "Different Label",
      })
      mockAuthenticatedUser()

      const result = await updateCustomCategory(category._id.toString(), {
        type: category.type,
        label: "Different Label",
        description: "Different description",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Danh mục với tên này đã tồn tại!")
    })

    it("should successfully update custom category", async () => {
      await insertTestCategory(category)
      mockAuthenticatedUser()

      const result = await updateCustomCategory(category._id.toString(), {
        type: "income",
        label: "Updated Label",
        description: "Updated description",
      })

      expect(result.success).toBe("Danh mục đã được cập nhật.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await updateCustomCategory(
        category._id.toString(),
        validCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Cập nhật danh mục thất bại! Vui lòng thử lại sau."
      )
    })
  })

  describe("deleteCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Category ID không hợp lệ!")
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không tìm thấy danh mục hoặc bạn không có quyền xóa!"
      )
    })

    it("should return error when category has associated transactions", async () => {
      await insertTestCategory(category)
      await insertTestTransaction({
        ...transaction,
        categoryKey: category.categoryKey,
      })
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không thể xóa danh mục. Có 1 giao dịch đang sử dụng danh mục này. Vui lòng xóa các giao dịch đó trước."
      )
    })

    it("should successfully delete custom category", async () => {
      await insertTestCategory(category)
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBe("Danh mục đã được xóa.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Xóa danh mục thất bại! Vui lòng thử lại sau.")
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await deleteCustomCategory(category._id.toString())

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Xóa danh mục thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("getCustomCategories", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getCustomCategories()

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return empty categories list", async () => {
      mockAuthenticatedUser()

      const result = await getCustomCategories()

      expect(result.customCategories).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return categories list", async () => {
      await insertTestCategory(category)
      mockAuthenticatedUser()

      const result = await getCustomCategories()

      expect(result.customCategories).toHaveLength(1)
      expect(result.customCategories?.[0].label).toBe("Entertainment")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await getCustomCategories()

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(
        "Tải danh sách danh mục tùy chỉnh thất bại! Vui lòng thử lại sau."
      )
    })
  })
})
