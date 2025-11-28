"use server"

import { cacheTag, updateTag } from "next/cache"
import { createTransactionSchema, type TransactionFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import { getTransactionsCollection } from "@/lib/collections"
import { type Transaction } from "@/lib/definitions"

import { getCurrentSession } from "./session.actions"

export async function createTransaction(values: TransactionFormValues) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userId = session.user.id

    const parsedValues = createTransactionSchema(t).safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    const transactionsCollection = await getTransactionsCollection()

    const data = {
      userId: new ObjectId(userId),
      type: values.type,
      categoryKey: values.categoryKey,
      amount: values.amount,
      description: values.description,
      date: values.date,
    }

    const existingTransaction = await transactionsCollection.findOne(data)

    if (existingTransaction) {
      return { error: t("transactions.be.transactionExists") }
    }

    const result = await transactionsCollection.insertOne(data)

    if (!result.acknowledged)
      return { error: t("transactions.be.transactionAddFailed") }

    updateTag("transactions")
    return { success: t("transactions.be.transactionAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { error: t("transactions.be.transactionAddFailed") }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const parsedValues = createTransactionSchema(t).safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("transactions.be.invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: t("transactions.be.transactionNotFoundOrNoPermission"),
      }
    }

    await transactionsCollection.updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          type: values.type,
          categoryKey: values.categoryKey,
          amount: values.amount,
          description: values.description,
          date: values.date,
        },
      }
    )

    updateTag("transactions")
    return {
      success: t("transactions.be.transactionUpdated"),
      error: undefined,
    }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return { error: t("transactions.be.transactionUpdateFailed") }
  }
}

export async function deleteTransaction(transactionId: string) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("transactions.be.invalidTransactionId"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: t("transactions.be.transactionNotFoundOrNoPermissionDelete"),
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
    })

    updateTag("transactions")
    return { success: t("transactions.be.transactionDeleted") }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: t("transactions.be.transactionDeleteFailed") }
  }
}

export async function getTransactions(
  userId: string,
  t: TypedTranslationFunction
) {
  "use cache: private"
  cacheTag("transactions")

  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

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
    return { error: t("transactions.be.transactionFetchFailed") }
  }
}
