"use server"

import { cacheTag, updateTag } from "next/cache"
import {
  createRecurringTransactionSchema,
  type RecurringTransactionFormValues,
} from "@/schemas"
import type { Filter } from "mongodb"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import { getRecurringTransactionsCollection } from "@/lib/collections"
import {
  type DBRecurringTransaction,
  type RecurringTransaction,
} from "@/lib/definitions"

import { getCurrentSession } from "./session.actions"

export async function createRecurringTransaction(
  values: RecurringTransactionFormValues
) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userId = session.user.id

    const parsedValues = createRecurringTransactionSchema(t).safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

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
      return { error: t("recurring.be.recurringExists") }
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
      return { error: t("recurring.be.recurringAddFailed") }

    updateTag("recurringTransactions")
    return { success: t("recurring.be.recurringAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating recurring transaction:", error)
    return { error: t("recurring.be.recurringAddFailed") }
  }
}

export async function updateRecurringTransaction(
  recurringId: string,
  values: RecurringTransactionFormValues
) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const parsedValues = createRecurringTransactionSchema(t).safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    if (!ObjectId.isValid(recurringId)) {
      return {
        error: t("recurring.be.invalidRecurringId"),
      }
    }

    const recurringCollection = await getRecurringTransactionsCollection()

    const existingRecurring = await recurringCollection.findOne({
      _id: new ObjectId(recurringId),
    })

    if (!existingRecurring) {
      return {
        error: t("recurring.be.recurringNotFoundOrNoPermission"),
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
      success: t("recurring.be.recurringUpdated"),
      error: undefined,
    }
  } catch (error) {
    console.error("Error updating recurring transaction:", error)
    return { error: t("recurring.be.recurringUpdateFailed") }
  }
}

export async function deleteRecurringTransaction(recurringId: string) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    if (!ObjectId.isValid(recurringId)) {
      return {
        error: t("recurring.be.invalidRecurringId"),
      }
    }

    const recurringCollection = await getRecurringTransactionsCollection()

    const existingRecurring = await recurringCollection.findOne({
      _id: new ObjectId(recurringId),
    })

    if (!existingRecurring) {
      return {
        error: t("recurring.be.recurringNotFoundOrNoPermissionDelete"),
      }
    }

    await recurringCollection.deleteOne({
      _id: new ObjectId(recurringId),
    })

    updateTag("recurringTransactions")
    return { success: t("recurring.be.recurringDeleted") }
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    return { error: t("recurring.be.recurringDeleteFailed") }
  }
}

export async function getRecurringTransactions(
  userId: string,
  t: TypedTranslationFunction
) {
  "use cache: private"
  cacheTag("recurringTransactions")

  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
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
      error: t("recurring.be.recurringFetchFailed"),
    }
  }
}
