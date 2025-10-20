"use server"

import { transactionSchema, type TransactionFormValues } from "@/schemas"
import { ObjectId } from "mongodb"

import { getTransactionCollection } from "@/lib/collections"
import { Transaction } from "@/lib/definitions"
import { session } from "@/lib/session"
import { normalizeToUTCDate } from "@/lib/utils"

export async function createTransaction(values: TransactionFormValues) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Dữ liệu không hợp lệ!" }
    }

    const transactionsCollection = await getTransactionCollection()

    const result = await transactionsCollection.insertOne({
      userId: new ObjectId(userId),
      type: values.type,
      categoryKey: values.categoryKey,
      amount: values.amount,
      description: values.description,
      date: normalizeToUTCDate(values.date),
    })

    if (!result.acknowledged)
      return { error: "Tạo giao dịch thất bại! Thử lại sau." }

    return { success: "Giao dịch đã được tạo.", error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { error: "Tạo giao dịch thất bại. Vui lòng thử lại sau." }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Dữ liệu không hợp lệ!" }
    }

    const transactionsCollection = await getTransactionCollection()

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: "Không tìm thấy giao dịch hoặc bạn không có quyền chỉnh sửa!",
      }
    }

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    if (!existingTransaction) {
      return {
        error: "Không tìm thấy giao dịch hoặc bạn không có quyền chỉnh sửa!",
      }
    }

    await transactionsCollection.updateOne(
      { _id: new ObjectId(transactionId), userId: new ObjectId(userId) },
      {
        $set: {
          type: values.type,
          categoryKey: values.categoryKey,
          amount: values.amount,
          description: values.description,
          date: normalizeToUTCDate(values.date),
        },
      }
    )

    return { success: "Giao dịch đã được cập nhật.", error: undefined }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return { error: "Cập nhật giao dịch thất bại! Vui lòng thử lại sau." }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const transactionsCollection = await getTransactionCollection()

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: "Không tìm thấy giao dịch hoặc bạn không có quyền xóa!",
      }
    }

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    if (!existingTransaction) {
      return {
        error: "Không tìm thấy giao dịch hoặc bạn không có quyền xóa!",
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    return { success: "Giao dịch đã được xóa." }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: "Xóa giao dịch thất bại! Vui lòng thử lại sau." }
  }
}

export async function getTransactions() {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: "Không có quyền truy cập! Vui lòng tải lại trang và thử lại.",
      }
    }

    const transactionsCollection = await getTransactionCollection()

    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .toArray()

    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        _id: transaction._id.toString(),
        userId: transaction.userId.toString(),
      })) as Transaction[],
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { error: "Tải danh sách giao dịch thất bại! Vui lòng thử lại sau." }
  }
}
