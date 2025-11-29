"use server"

import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getTransactionsCollection } from "@/lib/collections"
import { type Transaction } from "@/lib/definitions"
import type { TransactionFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"

export async function createTransaction(values: TransactionFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

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
      return { error: t("This transaction has already been created today!") }
    }

    const result = await transactionsCollection.insertOne(data)

    if (!result.acknowledged)
      return { error: t("Failed to add transaction! Please try again later.") }

    updateTag("transactions")
    return { success: t("Transaction has been added."), error: undefined }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { error: t("Failed to add transaction! Please try again later.") }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("Invalid transaction ID!"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: t("Transaction not found or you don't have permission to edit!"),
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
      success: t("Transaction has been updated."),
      error: undefined,
    }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return { error: t("Failed to update transaction! Please try again later.") }
  }
}

export async function deleteTransaction(transactionId: string) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("Invalid transaction ID!"),
      }
    }

    const transactionsCollection = await getTransactionsCollection()

    const existingTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(transactionId),
    })

    if (!existingTransaction) {
      return {
        error: t(
          "Transaction not found or you don't have permission to delete!"
        ),
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
    })

    updateTag("transactions")
    return { success: t("Transaction has been deleted.") }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: t("Failed to delete transaction! Please try again later.") }
  }
}

export async function getTransactions(userId: string) {
  "use cache: private"
  cacheTag("transactions")

  const t = await getExtracted()

  try {
    if (!userId) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
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
    return { error: t("Failed to load transactions! Please try again later.") }
  }
}
