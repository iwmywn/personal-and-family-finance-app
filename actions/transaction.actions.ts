"use server"

import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { convertTransactionsToCurrency } from "@/actions/exchange-rates.actions"
import { getTransactionsCollection } from "@/lib/collections"
import type { Currency } from "@/lib/currency"
import type { Transaction } from "@/lib/definitions"
import { isDuplicateKeyError } from "@/lib/indexes"
import { getSchemas } from "@/schemas/server"
import type { TransactionFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"
import { toDecimal128 } from "./utils"

export async function createTransaction(
  values: TransactionFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createTransactionSchema } = await getSchemas()
    const parsedValues = createTransactionSchema().safeParse(values)

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
    const transactionsCollection = await getTransactionsCollection()

    await transactionsCollection.insertOne({
      userId: new ObjectId(userId),
      type: parsedValues.data.type,
      categoryKey: parsedValues.data.categoryKey,
      amount: toDecimal128(parsedValues.data.amount),
      currency: parsedValues.data.currency,
      description: parsedValues.data.description,
      date: parsedValues.data.date,
    })

    updateTag(`transactions-${userId}`)
    return { success: t("Transaction has been added."), error: undefined }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This transaction already exists!") }
    }
    console.error("Error creating transaction:", error)
    return { error: t("Failed to add transaction! Please try again later.") }
  }
}

export async function updateTransaction(
  transactionId: string,
  values: TransactionFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createTransactionSchema } = await getSchemas()
    const parsedValues = createTransactionSchema().safeParse(values)

    if (!parsedValues.success) {
      return { error: t("Invalid data!") }
    }

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

    const userId = session.user.id
    const transactionsCollection = await getTransactionsCollection()
    const result = await transactionsCollection.updateOne(
      {
        _id: new ObjectId(transactionId),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          type: parsedValues.data.type,
          categoryKey: parsedValues.data.categoryKey,
          amount: toDecimal128(parsedValues.data.amount),
          currency: parsedValues.data.currency,
          description: parsedValues.data.description,
          date: parsedValues.data.date,
        },
      }
    )

    if (result.matchedCount === 0) {
      return {
        error: t("Transaction not found or you don't have permission to edit!"),
      }
    }

    updateTag(`transactions-${userId}`)
    return {
      success: t("Transaction has been updated."),
      error: undefined,
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This transaction already exists!") }
    }
    console.error("Error updating transaction:", error)
    return { error: t("Failed to update transaction! Please try again later.") }
  }
}

export async function deleteTransaction(transactionId: string): Promise<{
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

    if (!ObjectId.isValid(transactionId)) {
      return {
        error: t("Invalid transaction ID!"),
      }
    }

    const userId = session.user.id
    const transactionsCollection = await getTransactionsCollection()
    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(transactionId),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return {
        error: t(
          "Transaction not found or you don't have permission to delete!"
        ),
      }
    }

    updateTag(`transactions-${userId}`)
    return { success: t("Transaction has been deleted.") }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: t("Failed to delete transaction! Please try again later.") }
  }
}

export async function getTransactions(): Promise<{
  error?: string
  transactions?: Transaction[]
}> {
  const t = await getExtracted()
  const session = await getCurrentSession()

  if (!session) {
    return {
      error: t("Access denied! Please refresh the page and try again."),
    }
  }

  return getCachedTransactions(
    session.user.id,
    session.user.currency as Currency
  )
}

async function getCachedTransactions(userId: string, targetCurrency: Currency) {
  "use cache: private"
  cacheTag(`transactions-${userId}`)

  const t = await getExtracted()

  try {
    const transactionsCollection = await getTransactionsCollection()
    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1, _id: -1 })
      .toArray()
    const mapped = transactions.map((transaction) => ({
      ...transaction,
      _id: transaction._id.toString(),
      userId: transaction.userId.toString(),
      amount: transaction.amount.toString(),
    })) as Transaction[]
    const converted = await convertTransactionsToCurrency(
      mapped,
      targetCurrency
    )

    return {
      transactions: converted,
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { error: t("Failed to load transactions! Please try again later.") }
  }
}
