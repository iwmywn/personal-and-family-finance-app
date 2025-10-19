"use server"

import { customCategorySchema, type CustomCategoryFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { nanoid } from "nanoid"

import {
  getCategoryCollection,
  getTransactionCollection,
} from "@/lib/collections"
import { CustomCategory } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createCustomCategory(values: CustomCategoryFormValues) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Dữ liệu không hợp lệ!" }
    }

    const categoriesCollection = await getCategoryCollection()

    const existingCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
    })

    if (existingCategory) {
      return { error: "Danh mục với tên này đã tồn tại!" }
    }

    const shortId = nanoid(8)
    const categoryId = `custom_${values.type}_${shortId}`

    const duplicateCategoryId = await categoriesCollection.findOne({
      categoryId,
    })

    if (duplicateCategoryId) {
      return { error: "Lỗi tạo ID danh mục. Vui lòng thử lại." }
    }

    const result = await categoriesCollection.insertOne({
      userId: new ObjectId(userId),
      categoryId,
      type: values.type,
      label: values.label,
      description: values.description,
    })

    if (!result.acknowledged)
      return { error: "Tạo danh mục thất bại! Thử lại sau." }

    return { success: "Danh mục đã được tạo.", error: undefined }
  } catch (error) {
    console.error("Error creating custom category:", error)
    return { error: "Tạo danh mục thất bại. Vui lòng thử lại sau." }
  }
}

export async function updateCustomCategory(
  categoryId: string,
  values: CustomCategoryFormValues
) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const parsedValues = customCategorySchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Dữ liệu không hợp lệ!" }
    }

    const categoriesCollection = await getCategoryCollection()

    const existingCategory = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    if (!existingCategory) {
      return {
        error: "Không tìm thấy danh mục hoặc bạn không có quyền chỉnh sửa!",
      }
    }

    const duplicateCategory = await categoriesCollection.findOne({
      userId: new ObjectId(userId),
      label: values.label,
      type: values.type,
      _id: { $ne: new ObjectId(categoryId) },
    })

    if (duplicateCategory) {
      return { error: "Danh mục với tên này đã tồn tại!" }
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

    return { success: "Danh mục đã được cập nhật.", error: undefined }
  } catch (error) {
    console.error("Error updating custom category:", error)
    return { error: "Cập nhật danh mục thất bại! Vui lòng thử lại sau." }
  }
}

export async function deleteCustomCategory(categoryId: string) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
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
        error: "Không tìm thấy danh mục hoặc bạn không có quyền xóa!",
      }
    }

    const transactionCount = await transactionsCollection.countDocuments({
      userId: new ObjectId(userId),
      category: existingCategory.categoryId,
    })

    if (transactionCount > 0) {
      return {
        error: `Không thể xóa danh mục. Có ${transactionCount} giao dịch đang sử dụng danh mục này. Vui lòng xóa các giao dịch đó trước.`,
      }
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
      userId: new ObjectId(userId),
    })

    return { success: "Danh mục đã được xóa." }
  } catch (error) {
    console.error("Error deleting custom category:", error)
    return { error: "Xóa danh mục thất bại! Vui lòng thử lại sau." }
  }
}

export async function getCustomCategories() {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const categoriesCollection = await getCategoryCollection()

    const categories = await categoriesCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ _id: -1 })
      .toArray()

    return {
      categories: categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
        userId: category.userId.toString(),
      })) as CustomCategory[],
    }
  } catch (error) {
    console.error("Error fetching custom categories:", error)
    return {
      error: "Tải danh sách danh mục tùy chỉnh thất bại! Vui lòng thử lại sau.",
    }
  }
}
