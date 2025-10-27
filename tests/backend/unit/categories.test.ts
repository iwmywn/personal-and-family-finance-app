import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import {
  insertTestCategory,
  insertTestTransaction,
} from "@/tests/backend/helpers/database"
import {
  mockCategoryCollectionError,
  mockTransactionCollectionError,
  setupCategoryCollectionMock,
} from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockCustomCategory,
  mockTransaction,
  mockValidCategoryValues,
} from "@/tests/shared/data"
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

      const tCommonBE = await getTranslations("common.be")

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await createCustomCategory({
        type: "invalid" as "expense" | "income",
        label: "",
        description: "",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error when category with same name exists", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await createCustomCategory({
        type: mockCustomCategory.type,
        label: mockCustomCategory.label,
        description: "Different description",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryExists"))
    })

    it("should return error when duplicate categoryKey exists", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      vi.mock("nanoid", () => ({
        nanoid: () => "abcdef12",
      }))

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await createCustomCategory({
        type: "expense",
        label: "Dupe Key",
        description: "desc",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryKeyError"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockCategoriesCollection = setupCategoryCollectionMock()
      mockCategoriesCollection.findOne.mockResolvedValue(null)
      mockCategoriesCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryAddFailed"))
    })

    it("should successfully create custom category", async () => {
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBe(tCategoriesBE("categoryAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryAddFailed"))
    })
  })

  describe("updateCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: "invalid" as "expense" | "income",
          label: "",
          description: "",
        }
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await updateCustomCategory(
        "invalid-id",
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("invalidCategoryId"))
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryNotFoundOrNoPermission"))
    })

    it("should return error when duplicate category name exists", async () => {
      await insertTestCategory(mockCustomCategory)
      await insertTestCategory({
        ...mockCustomCategory,
        _id: new ObjectId("68f795d4bdcc3c9a30717977"),
        label: "Different Label",
      })
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: mockCustomCategory.type,
          label: "Different Label",
          description: "Different description",
        }
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryExists"))
    })

    it("should successfully update custom category", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: "income",
          label: "Updated Label",
          description: "Updated description",
        }
      )

      expect(result.success).toBe(tCategoriesBE("categoryUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryUpdateFailed"))
    })
  })

  describe("deleteCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("invalidCategoryId"))
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        tCategoriesBE("categoryNotFoundOrNoPermissionDelete")
      )
    })

    it("should return error when category has associated transactions", async () => {
      await insertTestCategory(mockCustomCategory)
      await insertTestTransaction({
        ...mockTransaction,
        categoryKey: mockCustomCategory.categoryKey,
      })
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        tCategoriesBE("categoryInUseWithCount", { count: 1 })
      )
    })

    it("should successfully delete custom category", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBe(tCategoriesBE("categoryDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryDeleteFailed"))
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryDeleteFailed"))
    })
  })

  describe("getCustomCategories", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await getCustomCategories()

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return empty categories list", async () => {
      mockAuthenticatedUser()

      const result = await getCustomCategories()

      expect(result.customCategories).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return categories list", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const result = await getCustomCategories()

      expect(result.customCategories).toHaveLength(1)
      expect(result.customCategories?.[0].label).toBe("Entertainment")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const tCategoriesBE = await getTranslations("categories.be")

      const result = await getCustomCategories()

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(tCategoriesBE("categoryFetchFailed"))
    })
  })
})
