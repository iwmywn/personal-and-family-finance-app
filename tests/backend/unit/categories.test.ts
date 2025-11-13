import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import {
  insertTestBudget,
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
  mockBudget,
  mockCustomCategory,
  mockTransaction,
  mockUser,
  mockValidCategoryValues,
} from "@/tests/shared/data"
import {
  createCustomCategory,
  deleteCustomCategory,
  getCustomCategories,
  updateCustomCategory,
} from "@/actions/categories"
import {
  getCategoriesCollection,
  getTransactionsCollection,
} from "@/lib/collections"

describe("Categories", async () => {
  const t = await getTranslations()

  describe("createCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await createCustomCategory({
        type: "invalid" as "expense" | "income",
        label: "",
        description: "",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when category with same name exists", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const result = await createCustomCategory({
        type: mockCustomCategory.type,
        label: mockCustomCategory.label,
        description: "Different description",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryExists"))
    })

    it("should return error when duplicate categoryKey exists", async () => {
      await insertTestCategory(mockCustomCategory)
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
      expect(result.error).toBe(t("categories.be.categoryKeyError"))
    })

    it("should return error when database insertion fails", async () => {
      mockAuthenticatedUser()
      const mockCategoriesCollection = setupCategoryCollectionMock()
      mockCategoriesCollection.findOne.mockResolvedValue(null)
      mockCategoriesCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      })

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryAddFailed"))
    })

    it("should successfully create custom category", async () => {
      mockAuthenticatedUser()

      const result = await createCustomCategory(mockValidCategoryValues)
      const categoriesTransaction = await getCategoriesCollection()
      const addedCategory = await categoriesTransaction.findOne({
        userId: mockUser._id,
      })

      expect(addedCategory?.categoryKey).toMatch(/^custom_/)
      expect(addedCategory?.type).toBe("income")
      expect(addedCategory?.label).toBe("Salary")
      expect(addedCategory?.description).toBe("Monthly job income")
      expect(result.success).toBe(t("categories.be.categoryAdded"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryAddFailed"))
    })
  })

  describe("updateCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: "invalid" as "expense" | "income",
          label: "",
          description: "",
        }
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        "invalid-id",
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.invalidCategoryId"))
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("categories.be.categoryNotFoundOrNoPermission")
      )
    })

    it("should return error when duplicate category name exists", async () => {
      await insertTestCategory(mockCustomCategory)
      await insertTestCategory({
        ...mockCustomCategory,
        _id: new ObjectId("68f795d4bdcc3c9a30717977"),
        categoryKey: "custom_expense_abcdef34",
        label: "Different Label",
      })
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: mockCustomCategory.type,
          label: "Different Label",
          description: "Different description",
        }
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryExists"))
    })

    it("should successfully update custom category", async () => {
      await Promise.all([
        insertTestCategory(mockCustomCategory),
        insertTestCategory({
          ...mockCustomCategory,
          _id: new ObjectId("68f795d4bdcc3c9a30717977"),
          userId: new ObjectId("690d2cdc200d6a719f9a438e"),
          categoryKey: "custom_expense_abcdef34",
          type: "expense",
          label: "Updated Label",
        }),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("6900f0887465621be45e8d30"),
          categoryKey: mockCustomCategory.categoryKey,
          type: "income",
        }),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("6900f0af8a1c0865ef9429c3"),
          categoryKey: mockCustomCategory.categoryKey,
          type: "income",
        }),
        insertTestTransaction({
          ...mockTransaction,
          _id: new ObjectId("6900f0b298e321c264864402"),
          type: "income",
        }),
      ])
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        {
          type: "expense",
          label: "Updated Label",
          description: "Updated description",
        }
      )
      const [categoriesTransaction, transactionsCollection] = await Promise.all(
        [getCategoriesCollection(), getTransactionsCollection()]
      )
      const [updatedCategory, relatedTransactions, unrelatedTransaction] =
        await Promise.all([
          categoriesTransaction.findOne({
            _id: mockCustomCategory._id,
          }),
          transactionsCollection
            .find({
              userId: mockUser._id,
              categoryKey: mockCustomCategory.categoryKey,
            })
            .toArray(),
          transactionsCollection.findOne({
            _id: new ObjectId("6900f0b298e321c264864402"),
          }),
        ])

      expect(updatedCategory?.categoryKey).toBe("custom_expense_abcdef12")
      expect(updatedCategory?.type).toBe("expense")
      expect(updatedCategory?.label).toBe("Updated Label")
      expect(updatedCategory?.description).toBe("Updated description")
      expect(relatedTransactions).toHaveLength(2)
      expect(relatedTransactions.every((t) => t.type === "expense")).toBe(true)
      expect(unrelatedTransaction?.type).toBe("income")
      expect(result.success).toBe(t("categories.be.categoryUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryUpdateFailed"))
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryUpdateFailed"))
    })
  })

  describe("deleteCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.invalidCategoryId"))
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("categories.be.categoryNotFoundOrNoPermissionDelete")
      )
    })

    it("should return error when category has associated transactions", async () => {
      await insertTestCategory(mockCustomCategory)
      await insertTestTransaction({
        ...mockTransaction,
        categoryKey: mockCustomCategory.categoryKey,
      })
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("categories.be.categoryInUseWithCountTransaction", { count: 1 })
      )
    })

    it("should return error when category has associated budgets", async () => {
      await insertTestCategory(mockCustomCategory)
      await insertTestBudget({
        ...mockBudget,
        categoryKey: mockCustomCategory.categoryKey,
      })
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        t("categories.be.categoryInUseWithCountBudget", { count: 1 })
      )
    })

    it("should successfully delete custom category", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )
      const categoriesTransaction = await getCategoriesCollection()
      const deletedCategory = await categoriesTransaction.findOne({
        _id: mockCustomCategory._id,
      })

      expect(deletedCategory).toBe(null)
      expect(result.success).toBe(t("categories.be.categoryDeleted"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryDeleteFailed"))
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryDeleteFailed"))
    })
  })

  describe("getCustomCategories", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getCustomCategories("", t)

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return empty categories list", async () => {
      mockAuthenticatedUser()

      const result = await getCustomCategories(mockUser._id.toString(), t)

      expect(result.customCategories).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return categories list", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const result = await getCustomCategories(mockUser._id.toString(), t)

      expect(result.customCategories).toHaveLength(1)
      expect(result.customCategories?.[0].label).toBe("Entertainment")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await getCustomCategories(mockUser._id.toString(), t)

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(t("categories.be.categoryFetchFailed"))
    })
  })
})
