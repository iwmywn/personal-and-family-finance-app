"use server"

import { cacheTag, updateTag } from "next/cache"
import type { Filter } from "mongodb"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getRecurringTransactionsCollection } from "@/lib/collections"
import {
  type DBRecurringTransaction,
  type RecurringTransaction,
} from "@/lib/definitions"
import type { RecurringTransactionFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"

export async function createRecurringTransaction(
  values: RecurringTransactionFormValues
) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    const recurringCollection = await getRecurringTransactionsCollection()

    const query: Filter<DBRecurringTransaction> = {
      userId: new ObjectId(userId),
      type: values.type,
      categoryKey: values.categoryKey,
      amount: values.amount,
      description: values.description,
      frequency: values.frequency,
      startDate: values.startDate,
    }

    if (values.frequency === "random") {
      query.randomEveryXDays = values.randomEveryXDays
    }

    const existingRecurring = await recurringCollection.findOne(query)

    if (existingRecurring) {
      return { error: t("This recurring transaction already exists!") }
    }

    const result = await recurringCollection.insertOne({
      userId: new ObjectId(userId),
      type: values.type,
      categoryKey: values.categoryKey,
      amount: values.amount,
      description: values.description,
      frequency: values.frequency,
      randomEveryXDays: values.randomEveryXDays,
      startDate: values.startDate,
      endDate: values.endDate,
      lastGenerated: undefined,
      isActive: values.isActive,
    })

    if (!result.acknowledged)
      return {
        error: t(
          "Failed to add recurring transaction! Please try again later."
        ),
      }

    updateTag("recurringTransactions")
    return {
      success: t("Recurring transaction has been added."),
      error: undefined,
    }
  } catch (error) {
    console.error("Error creating recurring transaction:", error)
    return {
      error: t("Failed to add recurring transaction! Please try again later."),
    }
  }
}

export async function updateRecurringTransaction(
  recurringId: string,
  values: RecurringTransactionFormValues
) {
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

    const recurringCollection = await getRecurringTransactionsCollection()

    const existingRecurring = await recurringCollection.findOne({
      _id: new ObjectId(recurringId),
    })

    if (!existingRecurring) {
      return {
        error: t(
          "Recurring transaction not found or you don't have permission to edit."
        ),
      }
    }

    await recurringCollection.updateOne(
      { _id: new ObjectId(recurringId) },
      {
        $set: {
          type: values.type,
          categoryKey: values.categoryKey,
          amount: values.amount,
          description: values.description,
          frequency: values.frequency,
          randomEveryXDays: values.randomEveryXDays,
          startDate: values.startDate,
          endDate: values.endDate,
          isActive: values.isActive,
        },
      }
    )

    updateTag("recurringTransactions")
    return {
      success: t("Recurring transaction has been updated."),
      error: undefined,
    }
  } catch (error) {
    console.error("Error updating recurring transaction:", error)
    return {
      error: t(
        "Failed to update recurring transaction! Please try again later."
      ),
    }
  }
}

export async function deleteRecurringTransaction(recurringId: string) {
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

    const recurringCollection = await getRecurringTransactionsCollection()

    const existingRecurring = await recurringCollection.findOne({
      _id: new ObjectId(recurringId),
    })

    if (!existingRecurring) {
      return {
        error: t(
          "Recurring transaction not found or you don't have permission to delete!"
        ),
      }
    }

    await recurringCollection.deleteOne({
      _id: new ObjectId(recurringId),
    })

    updateTag("recurringTransactions")
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

export async function getRecurringTransactions(userId: string) {
  "use cache: private"
  cacheTag("recurringTransactions")

  const t = await getExtracted()

  try {
    if (!userId) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

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
