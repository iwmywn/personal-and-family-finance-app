"use server"

import { cacheTag, updateTag } from "next/cache"
import type { TypedTranslationFunction } from "@/i18n/types"
import { createBudgetSchema, type BudgetFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getBudgetsCollection } from "@/lib/collections"
import { type Budget } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createBudget(values: BudgetFormValues) {
  try {
    const [tCommonBE, tBudgetsBE, tSchemasBudget] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("budgets.be"),
      getTranslations("schemas.budget"),
    ])
    const budgetSchema = createBudgetSchema(tSchemasBudget)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = budgetSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    const budgetsCollection = await getBudgetsCollection()

    const result = await budgetsCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      amount: values.amount,
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (!result.acknowledged) return { error: tBudgetsBE("budgetAddFailed") }

    updateTag("budgets")
    return { success: tBudgetsBE("budgetAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating budget:", error)
    const tBudgetsBE = await getTranslations("budgets.be")
    return { error: tBudgetsBE("budgetAddFailed") }
  }
}

export async function updateBudget(budgetId: string, values: BudgetFormValues) {
  try {
    const [tCommonBE, tBudgetsBE, tSchemasBudget] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("budgets.be"),
      getTranslations("schemas.budget"),
    ])
    const budgetSchema = createBudgetSchema(tSchemasBudget)
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = budgetSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: tBudgetsBE("invalidBudgetId"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: tBudgetsBE("budgetNotFoundOrNoPermission"),
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
    return { success: tBudgetsBE("budgetUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating budget:", error)
    const tBudgetsBE = await getTranslations("budgets.be")
    return { error: tBudgetsBE("budgetUpdateFailed") }
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const [tCommonBE, tBudgetsBE] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("budgets.be"),
    ])
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: tBudgetsBE("invalidBudgetId"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: tBudgetsBE("budgetNotFoundOrNoPermissionDelete"),
      }
    }

    await budgetsCollection.deleteOne({
      _id: new ObjectId(budgetId),
    })

    updateTag("budgets")
    return { success: tBudgetsBE("budgetDeleted") }
  } catch (error) {
    console.error("Error deleting budget:", error)
    const tBudgetsBE = await getTranslations("budgets.be")
    return { error: tBudgetsBE("budgetDeleteFailed") }
  }
}

export async function getBudgets(
  userId: string,
  tCommonBE: TypedTranslationFunction<"common.be">,
  tBudgetsBE: TypedTranslationFunction<"budgets.be">
) {
  "use cache"
  cacheTag("budgets")
  try {
    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
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
      error: tBudgetsBE("budgetFetchFailed"),
    }
  }
}
