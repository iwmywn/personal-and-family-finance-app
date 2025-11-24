"use server"

import { cacheTag, updateTag } from "next/cache"
import { createCategorySchema, type CategoryFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { nanoid } from "nanoid"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import {
  getBudgetsCollection,
  getCategoriesCollection,
  getGoalsCollection,
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { type Category } from "@/lib/definitions"

import { getCurrentSession } from "./session.actions"

export async function createCustomCategory(values: CategoryFormValues) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userId = session.user.id

    const customCategorySchema = createCategorySchema(t)
    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    const categoriesCollection = await getCategoriesCollection()

    const existingCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
    })

    if (existingCategory) {
      return { error: t("categories.be.categoryExists") }
    }

    const shortId = nanoid(8)
    const categoryKey = `custom_${values.type}_${shortId}`

    const duplicateCategoryKey = await categoriesCollection.findOne({
      categoryKey,
    })

    if (duplicateCategoryKey) {
      return { error: t("categories.be.categoryKeyError") }
    }

    const result = await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey,
      type: values.type,
      label: values.label,
      description: values.description,
    })

    if (!result.acknowledged)
      return { error: t("categories.be.categoryAddFailed") }

    updateTag("categories")
    return { success: t("categories.be.categoryAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating custom category:", error)
    return { error: t("categories.be.categoryAddFailed") }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CategoryFormValues
) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userId = session.user.id

    const customCategorySchema = createCategorySchema(t)
    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("categories.be.invalidCategoryId"),
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
        error: t("categories.be.categoryNotFoundOrNoPermission"),
      }
    }

    const duplicateCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
      _id: { $ne: new ObjectId(categoryId) },
    })

    if (duplicateCategory) {
      return { error: t("categories.be.categoryExists") }
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
    return { success: t("categories.be.categoryUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating custom category:", error)
    return { error: t("categories.be.categoryUpdateFailed") }
  }
}

export async function deleteCustomCategory(categoryId: string) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userId = session.user.id

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("categories.be.invalidCategoryId"),
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
        error: t("categories.be.categoryNotFoundOrNoPermissionDelete"),
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
        error: t("categories.be.categoryInUseWithCountTransaction", {
          count: transactionCount,
        }),
      }
    }

    if (budgetCount > 0) {
      return {
        error: t("categories.be.categoryInUseWithCountBudget", {
          count: budgetCount,
        }),
      }
    }

    if (goalCount > 0) {
      return {
        error: t("categories.be.categoryInUseWithCountGoal", {
          count: goalCount,
        }),
      }
    }

    if (recurringTransactionCount > 0) {
      return {
        error: t("categories.be.categoryInUseWithCountRecurringTransaction", {
          count: recurringTransactionCount,
        }),
      }
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
    })

    updateTag("categories")
    return { success: t("categories.be.categoryDeleted") }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    return { error: t("categories.be.categoryDeleteFailed") }
  }
}

export async function getCustomCategories(
  userId: string,
  t: TypedTranslationFunction
) {
  "use cache: private"
  cacheTag("categories")

  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
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
      error: t("categories.be.categoryFetchFailed"),
    }
  }
}
