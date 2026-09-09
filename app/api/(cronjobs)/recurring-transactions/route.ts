"use server"

import type { NextRequest } from "next/server"

import { ensureExchangeRateForDate } from "@/actions/exchange-rates.actions"
import { serverEnv } from "@/env/server"
import {
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { isDuplicateKeyError } from "@/lib/indexes"

import { shouldGenerateToday } from "./utils"

// Vercel Cron Jobs only trigger HTTP GET requests.
// [See official docs](https://vercel.com/docs/cron-jobs#how-cron-jobs-work)

const BATCH_SIZE = 50

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const [transactionsCollection, recurringCollection] = await Promise.all([
      getTransactionsCollection(),
      getRecurringTransactionsCollection(),
    ])

    const now = new Date()
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )

    await ensureExchangeRateForDate(todayUTC)

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

    for (let i = 0; i < activeRecurringTransactions.length; i += BATCH_SIZE) {
      const batch = activeRecurringTransactions.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (rec) => {
          if (!shouldGenerateToday(rec, todayUTC)) {
            skippedReason.push({ id: rec._id.toString(), reason: "notToday" })
            return
          }

          try {
            const insertResult = await transactionsCollection.insertOne({
              userId: rec.userId,
              type: rec.type,
              categoryKey: rec.categoryKey,
              amount: rec.amount,
              currency: rec.currency,
              description: rec.description,
              date: todayUTC,
            })

            await recurringCollection.updateOne(
              { _id: rec._id },
              { $set: { lastGeneratedDate: todayUTC } }
            )

            createdCount++
            createdIds.push(insertResult.insertedId.toString())
          } catch (error) {
            if (isDuplicateKeyError(error)) {
              // skip creating duplicate, but still update lastGeneratedDate to avoid repeated attempts
              await recurringCollection.updateOne(
                { _id: rec._id },
                { $set: { lastGeneratedDate: todayUTC } }
              )
              skippedReason.push({ id: rec._id.toString(), reason: "existing" })
              return
            }
            throw error
          }
        })
      )
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
