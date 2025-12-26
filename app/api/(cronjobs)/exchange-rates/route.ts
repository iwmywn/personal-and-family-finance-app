"use server"

import { type NextRequest } from "next/server"

import { toDecimal128 } from "@/actions/utils"
import { env } from "@/env/server.mjs"
import { getExchangeRatesCollection } from "@/lib/collections"
import { normalizeToUTCDate } from "@/lib/utils"

type CurrencyAPIResponse = {
  meta: {
    last_updated_at: string
  }
  data: {
    CNY: {
      code: "CNY"
      value: number
    }
    JPY: {
      code: "JPY"
      value: number
    }
    KRW: {
      code: "KRW"
      value: number
    }
    VND: {
      code: "VND"
      value: number
    }
  }
}

// Vercel Cron Jobs only trigger HTTP GET requests.
// [See official docs](https://vercel.com/docs/cron-jobs#how-cron-jobs-work)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const exchangeRatesCollection = await getExchangeRatesCollection()

    const lastExchangeRate = await exchangeRatesCollection
      .find({})
      .sort({ date: -1 })
      .limit(1)
      .toArray()

    // if no exchange rates exist, we don't have a starting point
    if (lastExchangeRate.length === 0) {
      return Response.json({
        success: true,
        message:
          "No existing exchange rates found. Please initialize manually.",
        timestamp: new Date().toISOString(),
      })
    }

    const todayUTC = normalizeToUTCDate(new Date())
    const lastDate = new Date(lastExchangeRate[0].date)
    lastDate.setUTCDate(lastDate.getUTCDate() + 1)
    const startDateUTC = normalizeToUTCDate(new Date(lastDate))

    // calculate how many days we need to fetch
    const yesterday = new Date(todayUTC)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayUTC = normalizeToUTCDate(new Date(yesterday))

    if (startDateUTC >= todayUTC) {
      return Response.json({
        success: true,
        message: "No new rates to fetch.",
        lastDate: lastExchangeRate.length > 0 ? lastExchangeRate[0].date : null,
        timestamp: new Date().toISOString(),
      })
    }

    // if startDate is > yesterday, we can't fetch yet (API only has data up to yesterday)
    if (startDateUTC > yesterdayUTC) {
      return Response.json({
        success: true,
        message: "Waiting for API to update.",
        lastDate: lastExchangeRate[0].date,
        nextFetchDate: startDateUTC,
        timestamp: new Date().toISOString(),
      })
    }

    const insertedDates: string[] = []
    const errors: { date: string; error: string }[] = []

    // fetch rates for each missing day
    const currentDate = new Date(startDateUTC)
    while (currentDate <= yesterdayUTC) {
      const dateStr = currentDate.toISOString().split("T")[0] // YYYY-MM-DD

      try {
        const apiUrl = `https://api.currencyapi.com/v3/historical?apikey=${env.CURRENCY_API_SECRET}&currencies=CNY%2CVND%2CJPY%2CKRW&date=${dateStr}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          errors.push({
            date: dateStr,
            error: `API returned ${response.status}!`,
          })
          currentDate.setUTCDate(currentDate.getUTCDate() + 1)
          continue
        }

        const data = (await response.json()) as CurrencyAPIResponse

        await exchangeRatesCollection.insertOne({
          date: normalizeToUTCDate(new Date(data.meta.last_updated_at)),
          rates: {
            CNY: toDecimal128(data.data.CNY.value.toString()),
            JPY: toDecimal128(data.data.JPY.value.toString()),
            KRW: toDecimal128(data.data.KRW.value.toString()),
            VND: toDecimal128(data.data.VND.value.toString()),
          },
        })

        insertedDates.push(dateStr)
      } catch (error) {
        errors.push({
          date: dateStr,
          error: error instanceof Error ? error.message : "Unknown error!",
        })
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    return Response.json({
      success: true,
      inserted: insertedDates.length,
      insertedDates,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("CRON ERROR:", error)
    return new Response("Cron failed", { status: 500 })
  }
}
