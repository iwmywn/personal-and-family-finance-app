"use server"

import { randomBytes } from "crypto"
import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import {
  getBudgetsCollection,
  getCategoriesCollection,
  getGoalsCollection,
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { type Category } from "@/lib/definitions"
import type { CategoryFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"

export async function createCustomCategory(values: CategoryFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    const categoriesCollection = await getCategoriesCollection()

    const existingCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
    })

    if (existingCategory) {
      return { error: t("This category already exists!") }
    }

    const categoryKey = randomBytes(4).toString("hex")

    const duplicateCategoryKey = await categoriesCollection.findOne({
      categoryKey,
    })

    if (duplicateCategoryKey) {
      return {
        error: t("Error creating category key! Please try again later."),
      }
    }

    const result = await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey,
      type: values.type,
      label: values.label,
      description: values.description,
    })

    if (!result.acknowledged)
      return { error: t("Failed to add category! Please try again later.") }

    updateTag("categories")
    return { success: t("Category has been added."), error: undefined }
  } catch (error) {
    console.error("Error creating custom category:", error)
    return { error: t("Failed to add category! Please try again later.") }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CategoryFormValues
) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("Invalid category ID!"),
      }
    }

    const [categoriesCollection, transactionsCollection] = await Promise.all([
      getCategoriesCollection(),
      getTransactionsCollection(),
    ])

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
    })

    if (!existingCategory) {
      return {
        error: t("Category not found or you don't have permission to edit!"),
      }
    }

    const duplicateCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
      _id: { $ne: new ObjectId(categoryId) },
    })

    if (duplicateCategory) {
      return { error: t("This category already exists!") }
    }

    await Promise.all([
      categoriesCollection.updateOne(
        { _id: new ObjectId(categoryId) },
        {
          $set: {
            type: values.type,
            label: values.label,
            description: values.description,
          },
        }
      ),
      transactionsCollection.updateMany(
        {
          userId: new ObjectId(userId),
          categoryKey: existingCategory.categoryKey,
        },
        {
          $set: {
            type: values.type,
          },
        }
      ),
    ])

    updateTag("categories")
    updateTag("transactions")
    return { success: t("Category has been updated."), error: undefined }
  } catch (error) {
    console.error("Error updating custom category:", error)
    return { error: t("Failed to update category! Please try again later.") }
  }
}

export async function deleteCustomCategory(categoryId: string) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("Invalid category ID!"),
      }
    }

    const [
      categoriesCollection,
      transactionsCollection,
      budgetsCollection,
      goalsCollection,
      recurringTransactionsCollection,
    ] = await Promise.all([
      getCategoriesCollection(),
      getTransactionsCollection(),
      getBudgetsCollection(),
      getGoalsCollection(),
      getRecurringTransactionsCollection(),
    ])

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
    })

    if (!existingCategory) {
      return {
        error: t("Category not found or you don't have permission to delete!"),
      }
    }

    const [
      transactionCount,
      budgetCount,
      goalCount,
      recurringTransactionCount,
    ] = await Promise.all([
      transactionsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: existingCategory.categoryKey,
      }),
      budgetsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: existingCategory.categoryKey,
      }),
      goalsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: existingCategory.categoryKey,
      }),
      recurringTransactionsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: existingCategory.categoryKey,
      }),
    ])

    if (transactionCount > 0) {
      return {
        error: t(
          "Cannot delete category. There are {count} transactions using this category. Please delete those transactions first.",
          {
            count: transactionCount.toString(),
          }
        ),
      }
    }

    if (budgetCount > 0) {
      return {
        error: t(
          "Cannot delete category. There are {count} budgets using this category. Please delete those budgets first.",
          {
            count: budgetCount.toString(),
          }
        ),
      }
    }

    if (goalCount > 0) {
      return {
        error: t(
          "Cannot delete category. There are {count} goals using this category. Please delete those goals first.",
          {
            count: goalCount.toString(),
          }
        ),
      }
    }

    if (recurringTransactionCount > 0) {
      return {
        error: t(
          "Cannot delete category. There are {count} recurring transactions using this category. Please delete those recurring transactions first.",
          {
            count: recurringTransactionCount.toString(),
          }
        ),
      }
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
    })

    updateTag("categories")
    return { success: t("Category has been deleted.") }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    return { error: t("Failed to delete category! Please try again later.") }
  }
}

export async function getCustomCategories(userId: string) {
  "use cache: private"
  cacheTag("categories")

  const t = await getExtracted()

  try {
    if (!userId) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const categoriesCollection = await getCategoriesCollection()

    const categories = await categoriesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ _id: -1 })
      .toArray()

    return {
      customCategories: categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
        userId: category.userId.toString(),
      })) as Category[],
    }
  } catch (error) {
    console.error("Error fetching custom categories:", error)
    return {
      error: t("Failed to load custom categories! Please try again later."),
    }
  }
}
