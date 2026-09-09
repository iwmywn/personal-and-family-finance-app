"use server"

import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getRecurringTransactionsCollection } from "@/lib/collections"
import type { RecurringTransaction } from "@/lib/definitions"
import { isDuplicateKeyError } from "@/lib/indexes"
import { getSchemas } from "@/schemas/server"
import type { RecurringTransactionFormValues } from "@/schemas/types"

import { isValidUserCategory } from "./category.actions"
import { getCurrentSession } from "./session.actions"
import { toDecimal128 } from "./utils"

export async function createRecurringTransaction(
  values: RecurringTransactionFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createRecurringTransactionSchema } = await getSchemas()
    const parsedValues = createRecurringTransactionSchema().safeParse(values)

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
    const isValidCategory = await isValidUserCategory(
      userId,
      parsedValues.data.categoryKey,
      parsedValues.data.type
    )

    if (!isValidCategory) {
      return { error: t("Invalid category!") }
    }

    const recurringCollection = await getRecurringTransactionsCollection()

    await recurringCollection.insertOne({
      userId: new ObjectId(userId),
      type: parsedValues.data.type,
      categoryKey: parsedValues.data.categoryKey,
      amount: toDecimal128(parsedValues.data.amount),
      currency: parsedValues.data.currency,
      description: parsedValues.data.description,
      frequency: parsedValues.data.frequency,
      randomEveryXDays: parsedValues.data.randomEveryXDays,
      startDate: parsedValues.data.startDate,
      endDate: parsedValues.data.endDate,
      lastGeneratedDate: undefined,
      isActive: parsedValues.data.isActive,
    })

    updateTag(`recurringTransactions-${userId}`)
    return {
      success: t("Recurring transaction has been added."),
      error: undefined,
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This recurring transaction already exists!") }
    }
    console.error("Error creating recurring transaction:", error)
    return {
      error: t("Failed to add recurring transaction! Please try again later."),
    }
  }
}

export async function updateRecurringTransaction(
  recurringId: string,
  values: RecurringTransactionFormValues
): Promise<{
  error?: string
  success?: string
}> {
  const t = await getExtracted()

  try {
    const { createRecurringTransactionSchema } = await getSchemas()
    const parsedValues = createRecurringTransactionSchema().safeParse(values)

    if (!parsedValues.success) {
      return { error: t("Invalid data!") }
    }

    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(recurringId)) {
      return {
        error: t("Invalid recurring transaction ID!"),
      }
    }

    const userId = session.user.id
    const isValidCategory = await isValidUserCategory(
      userId,
      parsedValues.data.categoryKey,
      parsedValues.data.type
    )

    if (!isValidCategory) {
      return { error: t("Invalid category!") }
    }

    const recurringCollection = await getRecurringTransactionsCollection()
    const result = await recurringCollection.updateOne(
      { _id: new ObjectId(recurringId), userId: new ObjectId(userId) },
      {
        $set: {
          type: parsedValues.data.type,
          categoryKey: parsedValues.data.categoryKey,
          amount: toDecimal128(parsedValues.data.amount),
          currency: parsedValues.data.currency,
          description: parsedValues.data.description,
          frequency: parsedValues.data.frequency,
          randomEveryXDays: parsedValues.data.randomEveryXDays,
          startDate: parsedValues.data.startDate,
          endDate: parsedValues.data.endDate,
          isActive: parsedValues.data.isActive,
        },
      }
    )

    if (result.matchedCount === 0) {
      return {
        error: t(
          "Recurring transaction not found or you don't have permission to edit."
        ),
      }
    }

    updateTag(`recurringTransactions-${userId}`)
    return {
      success: t("Recurring transaction has been updated."),
      error: undefined,
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: t("This recurring transaction already exists!") }
    }
    console.error("Error updating recurring transaction:", error)
    return {
      error: t(
        "Failed to update recurring transaction! Please try again later."
      ),
    }
  }
}

export async function deleteRecurringTransaction(recurringId: string): Promise<{
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

    if (!ObjectId.isValid(recurringId)) {
      return {
        error: t("Invalid recurring transaction ID!"),
      }
    }

    const userId = session.user.id
    const recurringCollection = await getRecurringTransactionsCollection()
    const result = await recurringCollection.deleteOne({
      _id: new ObjectId(recurringId),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return {
        error: t(
          "Recurring transaction not found or you don't have permission to delete!"
        ),
      }
    }

    updateTag(`recurringTransactions-${userId}`)
    return { success: t("Recurring transaction has been deleted.") }
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    return {
      error: t(
        "Failed to delete recurring transaction! Please try again later."
      ),
    }
  }
}

export async function getRecurringTransactions(): Promise<{
  error?: string
  recurringTransactions?: RecurringTransaction[]
}> {
  const t = await getExtracted()
  const session = await getCurrentSession()

  if (!session) {
    return {
      error: t("Access denied! Please refresh the page and try again."),
    }
  }

  return getCachedRecurringTransactions(session.user.id)
}

async function getCachedRecurringTransactions(userId: string) {
  "use cache: private"
  cacheTag(`recurringTransactions-${userId}`)

  const t = await getExtracted()

  try {
    const recurringCollection = await getRecurringTransactionsCollection()
    const recurringTransactions = await recurringCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ startDate: -1, _id: -1 })
      .toArray()

    return {
      recurringTransactions: recurringTransactions.map((recurring) => ({
        ...recurring,
        _id: recurring._id.toString(),
        userId: recurring.userId.toString(),
        amount: recurring.amount.toString(),
      })) as RecurringTransaction[],
    }
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    return {
      error: t(
        "Failed to load recurring transactions! Please try again later."
      ),
    }
  }
}
