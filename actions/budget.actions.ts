"use server"

import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getBudgetsCollection } from "@/lib/collections"
import { type Budget } from "@/lib/definitions"
import type { BudgetFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"
import { toDecimal128 } from "./utils"

export async function createBudget(values: BudgetFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      currency: values.currency,
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (existingBudget) {
      return { error: t("This budget already exists!") }
    }

    const result = await budgetsCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      currency: values.currency,
      allocatedAmount: toDecimal128(values.allocatedAmount),
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (!result.acknowledged)
      return { error: t("Failed to add budget! Please try again later.") }

    updateTag(`budgets-${userId}`)
    return { success: t("Budget has been added."), error: undefined }
  } catch (error) {
    console.error("Error creating budget:", error)
    return { error: t("Failed to add budget! Please try again later.") }
  }
}

export async function updateBudget(budgetId: string, values: BudgetFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: t("Invalid budget ID!"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: t("Budget not found or you don't have permission to edit!"),
      }
    }

    await budgetsCollection.updateOne(
      { _id: new ObjectId(budgetId) },
      {
        $set: {
          categoryKey: values.categoryKey,
          currency: values.currency,
          allocatedAmount: toDecimal128(values.allocatedAmount),
          startDate: values.startDate,
          endDate: values.endDate,
        },
      }
    )

    updateTag(`budgets-${session.user.id}`)
    return { success: t("Budget has been updated."), error: undefined }
  } catch (error) {
    console.error("Error updating budget:", error)
    return { error: t("Failed to update budget! Please try again later.") }
  }
}

export async function deleteBudget(budgetId: string) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(budgetId)) {
      return {
        error: t("Invalid budget ID!"),
      }
    }

    const budgetsCollection = await getBudgetsCollection()

    const existingBudget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
    })

    if (!existingBudget) {
      return {
        error: t("Budget not found or you don't have permission to delete!"),
      }
    }

    await budgetsCollection.deleteOne({
      _id: new ObjectId(budgetId),
    })

    updateTag(`budgets-${session.user.id}`)
    return { success: t("Budget has been deleted.") }
  } catch (error) {
    console.error("Error deleting budget:", error)
    return { error: t("Failed to delete budget! Please try again later.") }
  }
}

export async function getBudgets(userId: string) {
  "use cache: private"
  cacheTag(`budgets-${userId}`)

  const t = await getExtracted()

  try {
    if (!userId) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
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
        allocatedAmount: budget.allocatedAmount.toString(),
      })) as Budget[],
    }
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return {
      error: t("Failed to load budgets! Please try again later."),
    }
  }
}
