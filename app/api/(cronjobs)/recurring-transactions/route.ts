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

    const activeRecurringTransactions = await recurringCollection
      .find({ isActive: true })
      .toArray()

    let createdCount = 0
    const createdIds: string[] = []
    const skippedReason: { id: string; reason: "notToday" | "existing" }[] = []

    for (const rec of activeRecurringTransactions) {
      // Should we generate today?
      if (!shouldGenerateToday(rec, todayUTC)) {
        skippedReason.push({ id: rec._id.toString(), reason: "notToday" })
        continue
      }

      // Prevent duplicate transaction creation (if a transaction already exists for same day)
      const existing = await transactionsCollection.findOne({
        userId: rec.userId,
        amount: rec.amount,
        categoryKey: rec.categoryKey,
        type: rec.type,
        date: todayUTC,
      })

      if (existing) {
        // Skip creating duplicate, but still update lastGenerated to avoid repeated attempts
        await recurringCollection.updateOne(
          { _id: rec._id },
          { $set: { lastGenerated: todayUTC } }
        )
        skippedReason.push({ id: rec._id.toString(), reason: "existing" })
        continue
      }

      const insertResult = await transactionsCollection.insertOne({
        userId: rec.userId,
        type: rec.type,
        categoryKey: rec.categoryKey,
        amount: rec.amount,
        description: rec.description,
        date: todayUTC,
      })

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
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("CRON ERROR:", err)
    return new Response("Cron failed", { status: 500 })
  }
}
