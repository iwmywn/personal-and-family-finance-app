"use server"

import { cacheTag, updateTag } from "next/cache"
import { createGoalSchema, type GoalFormValues } from "@/schemas"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import { getGoalsCollection } from "@/lib/collections"
import { type Goal } from "@/lib/definitions"
import { session } from "@/lib/session"

export async function createGoal(values: GoalFormValues) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const goalSchema = createGoalSchema(t)
    const parsedValues = goalSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    const goalsCollection = await getGoalsCollection()

    const isCompleted = values.currentAmount >= values.targetAmount

    const result = await goalsCollection.insertOne({
      userId: new ObjectId(userId),
      name: values.name,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      deadline: values.deadline,
      categoryKey: values.categoryKey,
      isCompleted,
    })

    if (!result.acknowledged) return { error: t("goals.be.goalAddFailed") }

    updateTag("goals")
    return { success: t("goals.be.goalAdded"), error: undefined }
  } catch (error) {
    console.error("Error creating goal:", error)
    return { error: t("goals.be.goalAddFailed") }
  }
}

export async function updateGoal(goalId: string, values: GoalFormValues) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const goalSchema = createGoalSchema(t)
    const parsedValues = goalSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    if (!ObjectId.isValid(goalId)) {
      return {
        error: t("goals.be.invalidGoalId"),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(goalId),
    })

    if (!existingGoal) {
      return {
        error: t("goals.be.goalNotFoundOrNoPermission"),
      }
    }

    const isCompleted = values.currentAmount >= values.targetAmount

    await goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      {
        $set: {
          name: values.name,
          targetAmount: values.targetAmount,
          currentAmount: values.currentAmount,
          deadline: values.deadline,
          categoryKey: values.categoryKey,
          isCompleted,
        },
      }
    )

    updateTag("goals")
    return { success: t("goals.be.goalUpdated"), error: undefined }
  } catch (error) {
    console.error("Error updating goal:", error)
    return { error: t("goals.be.goalUpdateFailed") }
  }
}

export async function deleteGoal(goalId: string) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    if (!ObjectId.isValid(goalId)) {
      return {
        error: t("goals.be.invalidGoalId"),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(goalId),
    })

    if (!existingGoal) {
      return {
        error: t("goals.be.goalNotFoundOrNoPermissionDelete"),
      }
    }

    await goalsCollection.deleteOne({
      _id: new ObjectId(goalId),
    })

    updateTag("goals")
    return { success: t("goals.be.goalDeleted") }
  } catch (error) {
    console.error("Error deleting goal:", error)
    return { error: t("goals.be.goalDeleteFailed") }
  }
}

export async function getGoals(userId: string, t: TypedTranslationFunction) {
  "use cache"
  cacheTag("goals")
  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const goals = await goalsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ isCompleted: 1, deadline: 1, _id: -1 })
      .toArray()

    return {
      goals: goals.map((goal) => ({
        ...goal,
        _id: goal._id.toString(),
        userId: goal.userId.toString(),
      })) as Goal[],
    }
  } catch (error) {
    console.error("Error fetching goals:", error)
    return {
      error: t("goals.be.goalFetchFailed"),
    }
  }
}
