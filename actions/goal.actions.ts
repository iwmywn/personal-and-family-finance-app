"use server"

import { cacheTag, updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getGoalsCollection } from "@/lib/collections"
import { type Goal } from "@/lib/definitions"
import type { GoalFormValues } from "@/schemas/types"

import { getCurrentSession } from "./session.actions"

export async function createGoal(values: GoalFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const userId = session.user.id

    const goalsCollection = await getGoalsCollection()

    const existingGoal = await goalsCollection.findOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (existingGoal) {
      return { error: t("This goal already exists!") }
    }

    const result = await goalsCollection.insertOne({
      userId: new ObjectId(userId),
      categoryKey: values.categoryKey,
      name: values.name,
      targetAmount: values.targetAmount,
      startDate: values.startDate,
      endDate: values.endDate,
    })

    if (!result.acknowledged)
      return { error: t("Failed to add goal! Please try again later.") }

    updateTag("goals")
    return { success: t("Goal has been added."), error: undefined }
  } catch (error) {
    console.error("Error creating goal:", error)
    return { error: t("Failed to add goal! Please try again later.") }
  }
}

export async function updateGoal(goalId: string, values: GoalFormValues) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(goalId)) {
      return {
        error: t("Invalid goal ID!"),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(goalId),
    })

    if (!existingGoal) {
      return {
        error: t("Goal not found or you don't have permission to edit!"),
      }
    }

    await goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      {
        $set: {
          categoryKey: values.categoryKey,
          name: values.name,
          targetAmount: values.targetAmount,
          startDate: values.startDate,
          endDate: values.endDate,
        },
      }
    )

    updateTag("goals")
    return { success: t("Goal has been updated."), error: undefined }
  } catch (error) {
    console.error("Error updating goal:", error)
    return { error: t("Failed to update goal! Please try again later.") }
  }
}

export async function deleteGoal(goalId: string) {
  const t = await getExtracted()

  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    if (!ObjectId.isValid(goalId)) {
      return {
        error: t("Invalid goal ID!"),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const existingGoal = await goalsCollection.findOne({
      _id: new ObjectId(goalId),
    })

    if (!existingGoal) {
      return {
        error: t("Goal not found or you don't have permission to delete!"),
      }
    }

    await goalsCollection.deleteOne({
      _id: new ObjectId(goalId),
    })

    updateTag("goals")
    return { success: t("Goal has been deleted.") }
  } catch (error) {
    console.error("Error deleting goal:", error)
    return { error: t("Failed to delete goal! Please try again later.") }
  }
}

export async function getGoals(userId: string) {
  "use cache: private"
  cacheTag("goals")

  const t = await getExtracted()

  try {
    if (!userId) {
      return {
        error: t("Access denied! Please refresh the page and try again."),
      }
    }

    const goalsCollection = await getGoalsCollection()

    const goals = await goalsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ startDate: -1, _id: -1 })
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
      error: t("Failed to load goals! Please try again later."),
    }
  }
}
