"use server"

import Decimal from "decimal.js"
import type { Decimal128 } from "mongodb"

import { normalizeToUTCMidnight, toDecimal128 } from "@/actions/utils"
import { serverEnv } from "@/env/server"
import { getExchangeRatesCollection } from "@/lib/collections"
import { CURRENCIES } from "@/lib/currency"
import type { Currency } from "@/lib/currency"
import type {
  DBExchangeRate,
  ExchangeRate,
  Transaction,
} from "@/lib/definitions"
import { convertAmountWithRates, toDecimal } from "@/lib/utils"

export type DBRatesMap = Partial<Record<Exclude<Currency, "USD">, Decimal128>> &
  Record<string, Decimal128>
export type RatesMap = Partial<Record<Currency, Decimal>> &
  Record<string, Decimal>

export type CurrencyApiRateItem = {
  code: string
  value: number
}

export type CurrencyApiResponse = {
  meta: {
    last_updated_at: string
  }
  data: Record<string, CurrencyApiRateItem>
}

async function fetchCurrencyApiRatesForDate(dateStr: string) {
  const apiUrl = `https://api.currencyapi.com/v3/historical?apikey=${serverEnv.CURRENCY_API_SECRET}&currencies=${CURRENCIES.join(",")}&date=${dateStr}`
  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(
      `Currency API returned status ${response.status} for date ${dateStr}`
    )
  }

  const result = (await response.json()) as CurrencyApiResponse
  return Object.fromEntries(
    Object.entries(result.data).map(([code, item]) => [code, item.value])
  )
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
  const fetchedRates = await fetchCurrencyApiRatesForDate(dateStr)

  const updateFields: Record<string, Decimal128> = {}
  for (const [curr, rateVal] of Object.entries(fetchedRates)) {
    if (curr === "USD") continue
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

function toExchangeRate(doc: DBExchangeRate): ExchangeRate {
  const rates: RatesMap = { USD: toDecimal("1") }
  for (const [curr, val] of Object.entries(doc.rates)) {
    if (val) rates[curr] = toDecimal(val.toString())
  }
  return {
    ...doc,
    _id: doc._id.toString(),
    rates,
  } as ExchangeRate
}

async function fetchCandidateExchangeRates(
  minDate: Date,
  maxDate: Date
): Promise<ExchangeRate[]> {
  const collection = await getExchangeRatesCollection()

  const [inRangeRates, priorRate, afterRate] = await Promise.all([
    collection
      .find({ date: { $gte: minDate, $lte: maxDate } })
      .sort({ date: 1 })
      .toArray(),
    collection.findOne({ date: { $lte: minDate } }, { sort: { date: -1 } }),
    collection.findOne({ date: { $gte: maxDate } }, { sort: { date: 1 } }),
  ])

  const rawRates: DBExchangeRate[] = [
    ...(priorRate ? [priorRate] : []),
    ...inRangeRates,
    ...(afterRate ? [afterRate] : []),
  ]

  const uniqueDocs = Array.from(
    new Map(rawRates.map((doc) => [doc.date.getTime(), doc])).values()
  ).sort((a, b) => a.date.getTime() - b.date.getTime())

  return uniqueDocs.map(toExchangeRate)
}

function findNearestRate(rates: ExchangeRate[], txTime: number): ExchangeRate {
  let low = 0
  let high = rates.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midTime = rates[mid].date.getTime()
    if (midTime === txTime) return rates[mid]
    if (midTime < txTime) low = mid + 1
    else high = mid - 1
  }

  if (high < 0) return rates[0]
  if (low >= rates.length) return rates[rates.length - 1]

  const diffHigh = Math.abs(rates[high].date.getTime() - txTime)
  const diffLow = Math.abs(rates[low].date.getTime() - txTime)

  return diffHigh <= diffLow ? rates[high] : rates[low]
}

function convertSingleTransaction(
  transaction: Transaction,
  targetCurrency: Currency,
  rateDoc: ExchangeRate
): Transaction {
  const convertedAmount = convertAmountWithRates(
    new Decimal(transaction.amount),
    transaction.currency,
    targetCurrency,
    rateDoc.rates
  )

  const stringifiedRates = Object.fromEntries(
    Object.entries(rateDoc.rates).map(([curr, dec]) => [curr, dec.toString()])
  ) as Record<Currency, string>

  return {
    ...transaction,
    amount: convertedAmount.toString(),
    currency: targetCurrency,
    originalAmount: transaction.amount,
    originalCurrency: transaction.currency,
    rates: stringifiedRates,
  }
}

export async function convertTransactionsToCurrency(
  transactions: Transaction[],
  targetCurrency: Currency
): Promise<Transaction[]> {
  if (transactions.length === 0) return transactions

  const timestamps = transactions.map((t) =>
    normalizeToUTCMidnight(new Date(t.date)).getTime()
  )
  const minDate = new Date(Math.min(...timestamps))
  const maxDate = new Date(Math.max(...timestamps))

  const rates = await fetchCandidateExchangeRates(minDate, maxDate)
  if (rates.length === 0) return transactions

  return transactions.map((t, idx) => {
    const nearestRate = findNearestRate(rates, timestamps[idx])
    return convertSingleTransaction(t, targetCurrency, nearestRate)
  })
}
