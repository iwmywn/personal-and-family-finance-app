"use server"

import { createCategorySchema, type CustomCategoryFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { nanoid } from "nanoid"
import { getTranslations } from "next-intl/server"

import {
  getCategoriesCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { CustomCategory } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createCustomCategory(values: CustomCategoryFormValues) {
  try {
    const tCategoriesBE = await getTranslations("categories.be")
    const tCommonBE = await getTranslations("common.be")
    const tSchemasCategory = await getTranslations("schemas.category")
    const customCategorySchema = createCategorySchema(tSchemasCategory)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    const categoriesCollection = await getCategoriesCollection()

    const existingCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
    })

    if (existingCategory) {
      return { error: tCategoriesBE("categoryExists") }
    }

    const shortId = nanoid(8)
    const categoryKey = `custom_${values.type}_${shortId}`

    const duplicateCategoryKey = await categoriesCollection.findOne({
      categoryKey,
    })

    if (duplicateCategoryKey) {
      return { error: tCategoriesBE("categoryKeyError") }
    }

    const result = await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey,
      type: values.type,
      label: values.label,
      description: values.description,
    })

    if (!result.acknowledged)
      return { error: tCategoriesBE("categoryAddFailed") }

    return { success: tCategoriesBE("categoryAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating custom category:", error)
    const tCategoriesBE = await getTranslations("categories.be")
    return { error: tCategoriesBE("categoryAddFailed") }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CustomCategoryFormValues
) {
  try {
    const tCategoriesBE = await getTranslations("categories.be")
    const tCommonBE = await getTranslations("common.be")
    const tSchema = await getTranslations("schemas.category")
    const customCategorySchema = createCategorySchema(tSchema)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: tCategoriesBE("invalidCategoryId"),
      }
    }

    const categoriesCollection = await getCategoriesCollection()

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    if (!existingCategory) {
      return {
        error: tCategoriesBE("categoryNotFoundOrNoPermission"),
      }
    }

    const duplicateCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
      _id: { $ne: new ObjectId(categoryId) },
    })

    if (duplicateCategory) {
      return { error: tCategoriesBE("categoryExists") }
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

    return { success: tCategoriesBE("categoryUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating custom category:", error)
    const tCategoriesBE = await getTranslations("categories.be")
    return { error: tCategoriesBE("categoryUpdateFailed") }
  }
}

export async function deleteCustomCategory(categoryId: string) {
  try {
    const tCategoriesBE = await getTranslations("categories.be")
    const tCommonBE = await getTranslations("common.be")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    if (!ObjectId.isValid(categoryId)) {
      return {
        error: tCategoriesBE("invalidCategoryId"),
      }
    }

    const [categoriesCollection, transactionsCollection] = await Promise.all([
      getCategoriesCollection(),
      getTransactionsCollection(),
    ])

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    if (!existingCategory) {
      return {
        error: tCategoriesBE("categoryNotFoundOrNoPermissionDelete"),
      }
    }

    const transactionCount = await transactionsCollection.countDocuments({
      userId: new ObjectId(userId),
      categoryKey: existingCategory.categoryKey,
    })

    if (transactionCount > 0) {
      return {
        error: tCategoriesBE("categoryInUseWithCount", {
          count: transactionCount,
        }),
      }
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    return { success: tCategoriesBE("categoryDeleted") }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    const tCategoriesBE = await getTranslations("categories.be")
    return { error: tCategoriesBE("categoryDeleteFailed") }
  }
}

export async function getCustomCategories() {
  try {
    const tCommonBE = await getTranslations("common.be")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
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
      })) as CustomCategory[],
    }
  } catch (error) {
    console.error("Error fetching custom categories:", error)
    const tCategoriesBE = await getTranslations("categories.be")
    return {
      error: tCategoriesBE("categoryFetchFailed"),
    }
  }
}
