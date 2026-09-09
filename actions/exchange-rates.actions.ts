"use server"

import Decimal from "decimal.js"
import type { Decimal128 } from "mongodb"

import { normalizeToUTCMidnight, toDecimal128 } from "@/actions/utils"
import { getExchangeRatesCollection } from "@/lib/collections"
import { CURRENCIES } from "@/lib/currency"
import type { Currency } from "@/lib/currency"
import type { ExchangeRate, Transaction } from "@/lib/definitions"
import { convertAmountWithRates, toDecimal } from "@/lib/utils"

export type DBRatesMap = Partial<Record<Exclude<Currency, "USD">, Decimal128>> &
  Record<string, Decimal128>
export type RatesMap = Partial<Record<Currency, Decimal>> &
  Record<string, Decimal>

export type FrankfurterRateItem = {
  // date: string
  // base: string
  quote: string
  rate: number
}

async function fetchFrankfurterRatesForDate(dateStr: string, quotes: string[]) {
  if (quotes.length === 0) return {}

  const url = `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${quotes.join(",")}&date=${dateStr}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Frankfurter API returned status ${response.status} for date ${dateStr}`
    )
  }

  const data = (await response.json()) as FrankfurterRateItem[]
  return Object.fromEntries(data.map((item) => [item.quote, item.rate]))
}

export async function ensureExchangeRateForDate(date: Date): Promise<void> {
  const normalizedDate = normalizeToUTCMidnight(date)
  const collection = await getExchangeRatesCollection()
  const existing = await collection.findOne({ date: normalizedDate })

  const nonUSDCurrencies = CURRENCIES.filter((c) => c !== "USD")
  const missingCurrencies = nonUSDCurrencies.filter(
    (curr) => !existing?.rates || existing.rates[curr] === undefined
  )

  if (missingCurrencies.length === 0) return

  const dateStr = normalizedDate.toISOString().split("T")[0]
  const fetchedRates = await fetchFrankfurterRatesForDate(
    dateStr,
    missingCurrencies
  )

  const updateFields: Record<string, Decimal128> = {}
  for (const [curr, rateVal] of Object.entries(fetchedRates)) {
    updateFields[`rates.${curr}`] = toDecimal128(rateVal.toString())
  }

  if (Object.keys(updateFields).length > 0) {
    await collection.updateOne(
      { date: normalizedDate },
      { $set: updateFields },
      { upsert: true }
    )
  }
}

export async function convertTransactionsToCurrency(
  transactions: Transaction[],
  targetCurrency: Currency
): Promise<Transaction[]> {
  if (transactions.length === 0) return transactions

  const dates = transactions.map((t) => new Date(t.date))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  const collection = await getExchangeRatesCollection()
  const exchangeRates = await collection
    .find({ date: { $gte: minDate, $lte: maxDate } })
    .sort({ date: 1 })
    .toArray()

  if (exchangeRates.length === 0) return transactions

  const mappedRates = exchangeRates.map((doc) => {
    const rates: RatesMap = { USD: toDecimal("1") }
    for (const [curr, val] of Object.entries(doc.rates)) {
      if (val) rates[curr] = toDecimal(val.toString())
    }
    return {
      ...doc,
      _id: doc._id.toString(),
      rates,
    }
  }) as ExchangeRate[]

  const indexed = transactions
    .map((t, index) => ({ t: { ...t }, index }))
    .sort((a, b) => new Date(a.t.date).getTime() - new Date(b.t.date).getTime())

  let docIdx = 0
  let currentRates = mappedRates[0].rates
  const result: Transaction[] = new Array(transactions.length)

  for (const { t, index } of indexed) {
    const txTime = new Date(t.date).getTime()

    while (
      docIdx < mappedRates.length &&
      mappedRates[docIdx].date.getTime() <= txTime
    ) {
      currentRates = mappedRates[docIdx].rates
      docIdx++
    }

    const convertedAmount = convertAmountWithRates(
      new Decimal(t.amount),
      t.currency,
      targetCurrency,
      currentRates
    )

    const stringifiedRates = Object.fromEntries(
      Object.entries(currentRates).map(([curr, dec]) => [curr, dec.toString()])
    ) as Record<Currency, string>

    result[index] = {
      ...t,
      amount: convertedAmount.toString(),
      currency: targetCurrency,
      originalAmount: t.amount,
      originalCurrency: t.currency,
      rates: stringifiedRates,
    }
  }

  return result
}
