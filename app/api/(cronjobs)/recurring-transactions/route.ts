"use server"

import { type NextRequest } from "next/server"

import { env } from "@/env/server.mjs"
import {
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"
import { shouldGenerateToday } from "@/app/api/(cronjobs)/recurring-transactions/utils"

// Vercel Cron Jobs only trigger HTTP GET requests.
// [See official docs](https://vercel.com/docs/cron-jobs#how-cron-jobs-work)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const [transactionsCollection, recurringCollection] = await Promise.all([
      getTransactionsCollection(),
      getRecurringTransactionsCollection(),
    ])

    const todayUTC = normalizeToUTCDate(new Date())

    const deactivatedResult = await recurringCollection.updateMany(
      {
        isActive: true,
        endDate: { $exists: true, $lt: todayUTC },
      },
      { $set: { isActive: false } }
    )

    const activeRecurringTransactions = await recurringCollection
      .find({ isActive: true })
      .toArray()

    let createdCount = 0
    const createdIds: string[] = []
    const skippedReason: { id: string; reason: "notToday" | "existing" }[] = []

    for (const rec of activeRecurringTransactions) {
      if (!shouldGenerateToday(rec, todayUTC)) {
        skippedReason.push({ id: rec._id.toString(), reason: "notToday" })
        continue
      }

      const data = {
        userId: rec.userId,
        type: rec.type,
        categoryKey: rec.categoryKey,
        amount: rec.amount,
        currency: rec.currency,
        description: rec.description,
        date: todayUTC,
      }

      const existing = await transactionsCollection.findOne(data)

      if (existing) {
        // skip creating duplicate, but still update lastGenerated to avoid repeated attempts
        await recurringCollection.updateOne(
          { _id: rec._id },
          { $set: { lastGenerated: todayUTC } }
        )
        skippedReason.push({ id: rec._id.toString(), reason: "existing" })
        continue
      }

      const insertResult = await transactionsCollection.insertOne(data)

      await recurringCollection.updateOne(
        { _id: rec._id },
        { $set: { lastGenerated: todayUTC } }
      )

      createdCount++
      createdIds.push(insertResult.insertedId.toString())
    }

    return Response.json({
      success: true,
      created: createdCount,
      createdIds,
      skippedCount: skippedReason.length,
      skippedReason,
      deactivated: deactivatedResult.modifiedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("CRON ERROR:", error)
    return new Response("Cron failed", { status: 500 })
  }
}
