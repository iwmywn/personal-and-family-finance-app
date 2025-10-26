"use server"

import { transactionSchema, type TransactionFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getTransactionCollection } from "@/lib/collections"
import { Transaction } from "@/lib/definitions"
import { session } from "@/lib/session"
import { normalizeToUTCDate } from "@/lib/utils/date"

export async function createTransaction(values: TransactionFormValues) {
  try {
    const t = await getTranslations("transactions")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("invalidData") }
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

    if (!result.acknowledged) return { error: t("transactionAddFailed") }

    return { success: t("transactionAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    const t = await getTranslations("transactions")
    return { error: t("transactionAddFailed") }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  try {
    const t = await getTranslations("transactions")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const parsedValues = transactionSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("invalidData") }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    if (!existingTransaction) {
      return {
        error: t("transactionNotFoundOrNoPermission"),
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

    return { success: t("transactionUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating transaction:", error)
    const t = await getTranslations("transactions")
    return { error: t("transactionUpdateFailed") }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const t = await getTranslations("transactions")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    if (!existingTransaction) {
      return {
        error: t("transactionNotFoundOrNoPermissionDelete"),
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    return { success: t("transactionDeleted") }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    const t = await getTranslations("transactions")
    return { error: t("transactionDeleteFailed") }
  }
}

export async function getTransactions() {
  try {
    const t = await getTranslations("transactions")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const transactionsCollection = await getTransactionCollection()

    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1, _id: -1 })
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
    const t = await getTranslations("transactions")
    return { error: t("transactionFetchFailed") }
  }
}
