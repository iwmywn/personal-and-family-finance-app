"use server"

import type { NextRequest } from "next/server"

import { ensureExchangeRateForDate } from "@/actions/exchange-rates.actions"
import { normalizeToUTCMidnight } from "@/actions/utils"
import { serverEnv } from "@/env/server"
import {
  getExchangeRatesCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { CURRENCIES } from "@/lib/currency"

// Vercel Cron Jobs only trigger HTTP GET requests.
// [See official docs](https://vercel.com/docs/cron-jobs#how-cron-jobs-work)

const MAX_DATES_PER_RUN = 10

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const [transactionsCollection, exchangeRatesCollection] = await Promise.all(
      [getTransactionsCollection(), getExchangeRatesCollection()]
    )

    const now = new Date()
    const todayUTC = normalizeToUTCMidnight(now)
    const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000)

    const datesToCheck = new Set<number>()
    datesToCheck.add(yesterdayUTC.getTime())

    const txDates = (await transactionsCollection.distinct("date", {
      date: { $lte: yesterdayUTC },
    })) as Date[]

    for (const d of txDates) {
      if (d) {
        datesToCheck.add(normalizeToUTCMidnight(new Date(d)).getTime())
      }
    }

    const nonUSDCurrencies = CURRENCIES.filter((c) => c !== "USD")
    const checkDateObjs = Array.from(datesToCheck).map((ms) => new Date(ms))

    const existingRates = await exchangeRatesCollection
      .find({
        date: { $in: checkDateObjs },
      })
      .toArray()

    const existingMap = new Map(
      existingRates.map((r) => [r.date.getTime(), r.rates])
    )

    const missingDates: Date[] = []
    for (const ms of datesToCheck) {
      const rates = existingMap.get(ms)
      const isMissing =
        !rates || nonUSDCurrencies.some((c) => rates[c] === undefined)
      if (isMissing) {
        missingDates.push(new Date(ms))
      }
    }

    missingDates.sort((a, b) => a.getTime() - b.getTime())
    const datesToSync = missingDates.slice(0, MAX_DATES_PER_RUN)

    let syncedCount = 0
    const errors: { date: string; error: string }[] = []

    for (const d of datesToSync) {
      try {
        await ensureExchangeRateForDate(d)
        syncedCount++
      } catch (err) {
        errors.push({
          date: d.toISOString().split("T")[0],
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    return Response.json({
      success: true,
      checkedCount: datesToCheck.size,
      missingCount: missingDates.length,
      batchCount: datesToSync.length,
      syncedCount,
      remainingCount: Math.max(0, missingDates.length - datesToSync.length),
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("EXCHANGE RATES CRON ERROR:", error)
    return new Response("Exchange rates cron failed", { status: 500 })
  }
}
