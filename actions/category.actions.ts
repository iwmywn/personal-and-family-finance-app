"use server"

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
import { withTransaction } from "@/lib/db"
import type { Category } from "@/lib/definitions"
import { isDuplicateKeyError } from "@/lib/indexes"
import { getSchemas } from "@/schemas/server"
import type { CategoryFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"

export async function createCustomCategory(
  values: CategoryFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createCategorySchema } = await getSchemas()
    const parsedValues = createCategorySchema().safeParse(values)

    if (!parsedValues.success) {
      return { error: t("Invalid data!") }
    }

    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id
    const categoriesCollection = await getCategoriesCollection()

    await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      type: parsedValues.data.type,
      label: parsedValues.data.label,
      description: parsedValues.data.description,
    })

    updateTag(`categories-${userId}`)
    return { success: t("Category has been added."), error: undefined }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This category already exists!") }
    }
    console.error("Error creating custom category:", error)
    return { error: t("Failed to add category! Please try again later.") }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CategoryFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createCategorySchema } = await getSchemas()
    const parsedValues = createCategorySchema().safeParse(values)

    if (!parsedValues.success) {
      return { error: t("Invalid data!") }
    }

    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("Invalid category ID!"),
      }
    }

    const userId = session.user.id
    const [categoriesCollection, transactionsCollection] = await Promise.all([
      getCategoriesCollection(),
      getTransactionsCollection(),
    ])

    let notFound = false

    await withTransaction(async (dbSession) => {
      const result = await categoriesCollection.updateOne(
        { _id: new ObjectId(categoryId), userId: new ObjectId(userId) },
        {
          $set: {
            type: parsedValues.data.type,
            label: parsedValues.data.label,
            description: parsedValues.data.description,
          },
        },
        { session: dbSession }
      )

      if (result.matchedCount === 0) {
        notFound = true
        return
      }

      await transactionsCollection.updateMany(
        {
          userId: new ObjectId(userId),
          categoryKey: categoryId,
        },
        {
          $set: {
            type: parsedValues.data.type,
          },
        },
        { session: dbSession }
      )
    })

    if (notFound) {
      return {
        error: t("Category not found or you don't have permission to edit!"),
      }
    }

    updateTag(`categories-${userId}`)
    updateTag(`transactions-${userId}`)
    return { success: t("Category has been updated."), error: undefined }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This category already exists!") }
    }
    console.error("Error updating custom category:", error)
    return { error: t("Failed to update category! Please try again later.") }
  }
}

export async function deleteCustomCategory(categoryId: string): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("Invalid category ID!"),
      }
    }

    const userId = session.user.id
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
      userId: new ObjectId(userId),
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
        categoryKey: categoryId,
      }),
      budgetsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: categoryId,
      }),
      goalsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: categoryId,
      }),
      recurringTransactionsCollection.countDocuments({
        userId: new ObjectId(userId),
        categoryKey: categoryId,
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
      userId: new ObjectId(userId),
    })

    updateTag(`categories-${userId}`)
    return { success: t("Category has been deleted.") }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    return { error: t("Failed to delete category! Please try again later.") }
  }
}

export async function getCustomCategories(): Promise<{
  error?: string
  customCategories?: Category[]
}> {
  const t = await getExtracted()
  const session = await getCurrentSession()

  if (!session) {
    return {
      error: t("Access denied! Please refresh the page and try again."),
    }
  }

  return getCachedCustomCategories(session.user.id)
}

async function getCachedCustomCategories(userId: string) {
  "use cache: private"
  cacheTag(`categories-${userId}`)

  const t = await getExtracted()

  try {
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
