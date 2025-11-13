"use server"

import { cacheTag, updateTag } from "next/cache"
import { createBudgetSchema, type BudgetFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import { getBudgetsCollection } from "@/lib/collections"
import { type Budget } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createBudget(values: BudgetFormValues) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const budgetSchema = createBudgetSchema(t)
    const parsedValues = budgetSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    const budgetsCollection = await getBudgetsCollection()

    const result = await budgetsCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      amount: values.amount,
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (!result.acknowledged) return { error: t("budgets.be.budgetAddFailed") }

    updateTag("budgets")
    return { success: t("budgets.be.budgetAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating budget:", error)
    return { error: t("budgets.be.budgetAddFailed") }
  }
}

export async function updateBudget(budgetId: string, values: BudgetFormValues) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const budgetSchema = createBudgetSchema(t)
    const parsedValues = budgetSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: t("budgets.be.invalidBudgetId"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: t("budgets.be.budgetNotFoundOrNoPermission"),
      }
    }

    await budgetsCollection.updateOne(
      { _id: new ObjectId(budgetId) },
      {
        $set: {
          categoryKey: values.categoryKey,
          amount: values.amount,
          startDate: values.startDate,
          endDate: values.endDate,
        },
      }
    )

    updateTag("budgets")
    return { success: t("budgets.be.budgetUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating budget:", error)
    return { error: t("budgets.be.budgetUpdateFailed") }
  }
}

export async function deleteBudget(budgetId: string) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: t("budgets.be.invalidBudgetId"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: t("budgets.be.budgetNotFoundOrNoPermissionDelete"),
      }
    }

    await budgetsCollection.deleteOne({
      _id: new ObjectId(budgetId),
    })

    updateTag("budgets")
    return { success: t("budgets.be.budgetDeleted") }
  } catch (error) {
    console.error("Error deleting budget:", error)
    return { error: t("budgets.be.budgetDeleteFailed") }
  }
}

export async function getBudgets(userId: string, t: TypedTranslationFunction) {
  "use cache"
  cacheTag("budgets")
  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const budgets = await budgetsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ startDate: -1, _id: -1 })
      .toArray()

    return {
      budgets: budgets.map((budget) => ({
        ...budget,
        _id: budget._id.toString(),
        userId: budget.userId.toString(),
      })) as Budget[],
    }
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return {
      error: t("budgets.be.budgetFetchFailed"),
    }
  }
}
