import { updateTag } from "next/cache"
import type { NextRequest } from "next/server"

import { serverEnv } from "@/env/server"
import {
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { normalizeToUTCMidnight } from "@/lib/date"
import { isDuplicateKeyError } from "@/lib/indexes"

import { getDueDates } from "./utils"

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

    const todayUTC = normalizeToUTCMidnight(new Date())

    const activeRecurringTransactions = await recurringCollection
      .find({
        $or: [
          { endDate: { $exists: false } },
          { endDate: null as unknown as Date },
          { endDate: { $gte: todayUTC } },
        ],
      })
      .toArray()

    let createdCount = 0
    const createdIds: string[] = []
    const skippedReason: { id: string; reason: "notToday" | "existing" }[] = []
    const affectedUserIds = new Set<string>()
    const datesToEnsure = new Set<number>()

    for (let i = 0; i < activeRecurringTransactions.length; i += BATCH_SIZE) {
      const batch = activeRecurringTransactions.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (rec) => {
          const dueDates = getDueDates(rec, todayUTC)
          if (dueDates.length === 0) {
            skippedReason.push({ id: rec._id.toString(), reason: "notToday" })
            return
          }

          for (const targetDate of dueDates) {
            const existingTransaction = await transactionsCollection.findOne({
              recurringId: rec._id,
              date: targetDate,
            })

            if (existingTransaction) {
              await recurringCollection.updateOne(
                { _id: rec._id },
                { $set: { lastGeneratedDate: targetDate } }
              )
              skippedReason.push({ id: rec._id.toString(), reason: "existing" })
              affectedUserIds.add(rec.userId.toString())
              continue
            }

            try {
              const insertResult = await transactionsCollection.insertOne({
                userId: rec.userId,
                type: rec.type,
                categoryKey: rec.categoryKey,
                amount: rec.amount,
                currency: rec.currency,
                description: rec.description,
                date: targetDate,
                recurringId: rec._id,
              })

              await recurringCollection.updateOne(
                { _id: rec._id },
                { $set: { lastGeneratedDate: targetDate } }
              )

              createdCount++
              createdIds.push(insertResult.insertedId.toString())
              affectedUserIds.add(rec.userId.toString())
              datesToEnsure.add(targetDate.getTime())
            } catch (error) {
              if (isDuplicateKeyError(error)) {
                // skip creating duplicate, but still update lastGeneratedDate to avoid repeated attempts
                await recurringCollection.updateOne(
                  { _id: rec._id },
                  { $set: { lastGeneratedDate: targetDate } }
                )
                skippedReason.push({
                  id: rec._id.toString(),
                  reason: "existing",
                })
                affectedUserIds.add(rec.userId.toString())
                continue
              }
              throw error
            }
          }
        })
      )
    }

    for (const userId of affectedUserIds) {
      updateTag(`transactions-${userId}`)
      updateTag(`recurringTransactions-${userId}`)
    }

    return Response.json({
      success: true,
      created: createdCount,
      createdIds,
      skippedCount: skippedReason.length,
      skippedReason,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("RECURRING TRANSACTIONS CRON ERROR:", error)
    return new Response("Recurring transactions cron failed", { status: 500 })
  }
}
