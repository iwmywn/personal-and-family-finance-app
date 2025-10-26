"use server"

import { customCategorySchema, type CustomCategoryFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { nanoid } from "nanoid"
import { getTranslations } from "next-intl/server"

import {
  getCategoryCollection,
  getTransactionCollection,
} from "@/lib/collections"
import { CustomCategory } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createCustomCategory(values: CustomCategoryFormValues) {
  try {
    const t = await getTranslations("categories")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("invalidData") }
    }

    const categoriesCollection = await getCategoryCollection()

    const existingCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
    })

    if (existingCategory) {
      return { error: t("categoryExists") }
    }

    const shortId = nanoid(8)
    const categoryKey = `custom_${values.type}_${shortId}`

    const duplicateCategoryKey = await categoriesCollection.findOne({
      categoryKey,
    })

    if (duplicateCategoryKey) {
      return { error: t("categoryKeyError") }
    }

    const result = await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey,
      type: values.type,
      label: values.label,
      description: values.description,
    })

    if (!result.acknowledged) return { error: t("categoryAddFailed") }

    return { success: t("categoryAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating custom category:", error)
    const t = await getTranslations("categories")
    return { error: t("categoryAddFailed") }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CustomCategoryFormValues
) {
  try {
    const t = await getTranslations("categories")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("invalidData") }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("invalidCategoryId"),
      }
    }

    const categoriesCollection = await getCategoryCollection()

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    if (!existingCategory) {
      return {
        error: t("categoryNotFoundOrNoPermission"),
      }
    }

    const duplicateCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
      _id: { $ne: new ObjectId(categoryId) },
    })

    if (duplicateCategory) {
      return { error: t("categoryExists") }
    }

    await categoriesCollection.updateOne(
      { _id: new ObjectId(categoryId), userId: new ObjectId(userId) },
      {
        $set: {
          type: values.type,
          label: values.label,
          description: values.description,
        },
      }
    )

    return { success: t("categoryUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating custom category:", error)
    const t = await getTranslations("categories")
    return { error: t("categoryUpdateFailed") }
  }
}

export async function deleteCustomCategory(categoryId: string) {
  try {
    const t = await getTranslations("categories")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: t("invalidCategoryId"),
      }
    }

    const [categoriesCollection, transactionsCollection] = await Promise.all([
      getCategoryCollection(),
      getTransactionCollection(),
    ])

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    if (!existingCategory) {
      return {
        error: t("categoryNotFoundOrNoPermissionDelete"),
      }
    }

    const transactionCount = await transactionsCollection.countDocuments({
      userId: new ObjectId(userId),
      categoryKey: existingCategory.categoryKey,
    })

    if (transactionCount > 0) {
      return {
        error: t("categoryInUseWithCount", { count: transactionCount }),
      }
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    return { success: t("categoryDeleted") }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    const t = await getTranslations("categories")
    return { error: t("categoryDeleteFailed") }
  }
}

export async function getCustomCategories() {
  try {
    const t = await getTranslations("categories")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const categoriesCollection = await getCategoryCollection()

    const categories = await categoriesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ _id: -1 })
      .toArray()

    return {
      customCategories: categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
        userId: category.userId.toString(),
      })) as CustomCategory[],
    }
  } catch (error) {
    console.error("Error fetching custom categories:", error)
    const t = await getTranslations("categories")
    return {
      error: t("categoryFetchFailed"),
    }
  }
}
