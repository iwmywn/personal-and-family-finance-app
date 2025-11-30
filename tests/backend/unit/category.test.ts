import { ObjectId } from "mongodb"

import {
  insertTestBudget,
  insertTestCategory,
  insertTestGoal,
  insertTestRecurringTransaction,
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
  mockGoal,
  mockRecurringTransaction,
  mockTransaction,
  mockUser,
  mockValidCategoryValues,
} from "@/tests/shared/data"
import {
  createCustomCategory,
  deleteCustomCategory,
  getCustomCategories,
  updateCustomCategory,
} from "@/actions/category.actions"
import {
  getCategoriesCollection,
  getTransactionsCollection,
} from "@/lib/collections"

describe("Categories", async () => {
  describe("createCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
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
      expect(result.error).toBe("This category already exists!")
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
      expect(result.error).toBe(
        "Error creating category key! Please try again later."
      )
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
      expect(result.error).toBe(
        "Failed to add category! Please try again later."
      )
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
      expect(result.success).toBe("Category has been added.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await createCustomCategory(mockValidCategoryValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to add category! Please try again later."
      )
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
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        "invalid-id",
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid category ID!")
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Category not found or you don't have permission to edit!"
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
      expect(result.error).toBe("This category already exists!")
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
      expect(result.success).toBe("Category has been updated.")
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
      expect(result.error).toBe(
        "Failed to update category! Please try again later."
      )
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockTransactionCollectionError()

      const result = await updateCustomCategory(
        mockCustomCategory._id.toString(),
        mockValidCategoryValues
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to update category! Please try again later."
      )
    })
  })

  describe("deleteCustomCategory", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return error with invalid category ID", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory("invalid-id")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Invalid category ID!")
    })

    it("should return error when category not found", async () => {
      mockAuthenticatedUser()

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Category not found or you don't have permission to delete!"
      )
    })

    it("should return error when categories have associated transactions, budgets, or goals", async () => {
      const category1 = {
        ...mockCustomCategory,
        _id: new ObjectId("691ac8b98629369bb1da9214"),
        categoryKey: "custom_expense_abcdef12",
      }
      const category2 = {
        ...mockCustomCategory,
        _id: new ObjectId("691ac8c4fb168bfba59615c8"),
        categoryKey: "custom_expense_abcdef13",
      }
      const category3 = {
        ...mockCustomCategory,
        _id: new ObjectId("691ac8cd3cf60fa9f018a37c"),
        categoryKey: "custom_expense_abcdef14",
      }
      const category4 = {
        ...mockCustomCategory,
        _id: new ObjectId("691da72dc1d54fad20174ab6"),
        categoryKey: "custom_expense_abcdef15",
      }

      await Promise.all([
        insertTestCategory(category1),
        insertTestCategory(category2),
        insertTestCategory(category3),
        insertTestCategory(category4),

        insertTestTransaction({
          ...mockTransaction,
          categoryKey: category1.categoryKey,
        }),
        insertTestBudget({
          ...mockBudget,
          categoryKey: category2.categoryKey,
        }),
        insertTestGoal({
          ...mockGoal,
          categoryKey: category3.categoryKey,
        }),
        insertTestRecurringTransaction({
          ...mockRecurringTransaction,
          categoryKey: category4.categoryKey,
        }),
      ])

      mockAuthenticatedUser()

      const [result1, result2, result3, result4] = await Promise.all([
        deleteCustomCategory(category1._id.toString()),
        deleteCustomCategory(category2._id.toString()),
        deleteCustomCategory(category3._id.toString()),
        deleteCustomCategory(category4._id.toString()),
      ])

      expect(result1.success).toBeUndefined()
      expect(result1.error).toBe(
        "Cannot delete category. There are 1 transactions using this category. Please delete those transactions first."
      )

      expect(result2.success).toBeUndefined()
      expect(result2.error).toBe(
        "Cannot delete category. There are 1 budgets using this category. Please delete those budgets first."
      )

      expect(result3.success).toBeUndefined()
      expect(result3.error).toBe(
        "Cannot delete category. There are 1 goals using this category. Please delete those goals first."
      )

      expect(result4.success).toBeUndefined()
      expect(result4.error).toBe(
        "Cannot delete category. There are 1 recurring transactions using this category. Please delete those recurring transactions first."
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
      expect(result.success).toBe("Category has been deleted.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()
      mockCategoryCollectionError()
      // same for mockTransactionCollectionError, mockBudgetCollectionError, mockGoalCollectionError

      const result = await deleteCustomCategory(
        mockCustomCategory._id.toString()
      )

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Failed to delete category! Please try again later."
      )
    })
  })

  describe("getCustomCategories", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getCustomCategories("")

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
    })

    it("should return empty categories list", async () => {
      mockAuthenticatedUser()

      const result = await getCustomCategories(mockUser._id.toString())

      expect(result.customCategories).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it("should return categories list", async () => {
      await insertTestCategory(mockCustomCategory)
      mockAuthenticatedUser()

      const result = await getCustomCategories(mockUser._id.toString())

      expect(result.customCategories).toHaveLength(1)
      expect(result.customCategories?.[0].label).toBe("Entertainment")
      expect(result.error).toBeUndefined()
    })

    it("should return categories sorted by _id descending", async () => {
      const category1 = {
        ...mockCustomCategory,
        _id: new ObjectId("68f732914e63e5aa249cc173"),
        categoryKey: "custom_expense_abcdef12",
      }
      const category2 = {
        ...mockCustomCategory,
        _id: new ObjectId("68f732914e63e5aa249cc174"),
        categoryKey: "custom_expense_abcdef13",
      }
      const category3 = {
        ...mockCustomCategory,
        _id: new ObjectId("68f732914e63e5aa249cc175"),
        categoryKey: "custom_expense_abcdef14",
      }

      await Promise.all([
        insertTestCategory(category1),
        insertTestCategory(category2),
        insertTestCategory(category3),
      ])
      mockAuthenticatedUser()

      const result = await getCustomCategories(mockUser._id.toString())

      expect(result.customCategories).toHaveLength(3)
      // Should be sorted by _id descending
      expect(result.customCategories?.[0]._id).toBe("68f732914e63e5aa249cc175")
      expect(result.customCategories?.[1]._id).toBe("68f732914e63e5aa249cc174")
      expect(result.customCategories?.[2]._id).toBe("68f732914e63e5aa249cc173")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockCategoryCollectionError()

      const result = await getCustomCategories(mockUser._id.toString())

      expect(result.customCategories).toBeUndefined()
      expect(result.error).toBe(
        "Failed to load custom categories! Please try again later."
      )
    })
  })
})
