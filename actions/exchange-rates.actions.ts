"use server"

import Decimal from "decimal.js"
import type { Decimal128 } from "mongodb"

import { getExchangeRatesCollection } from "@/lib/collections"
import type { Currency } from "@/lib/currency"
import type { ExchangeRate, Transaction } from "@/lib/definitions"
import { convertAmountWithRates } from "@/lib/utils"

export type DBRatesMap = Record<Exclude<Currency, "USD">, Decimal128>
export type RatesMap = Record<Currency, Decimal>

export async function convertTransactionsToCurrency(
  transactions: Transaction[],
  targetCurrency: Currency
): Promise<Transaction[]> {
  if (transactions.length === 0) return transactions

  const dates = transactions.map((t) => new Date(t.date))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  const exchangeRatesCollection = await getExchangeRatesCollection()
  const exchangeRates = await exchangeRatesCollection
    .find({
      date: {
        $gte: minDate,
        $lte: maxDate,
      },
    })
    .sort({ date: 1 })
    .toArray()

  const mapped = exchangeRates.map((rates) => ({
    ...rates,
    _id: rates._id.toString(),
    rates: {
      USD: new Decimal(1),
      CNY: new Decimal(rates.rates.CNY.toString()),
      JPY: new Decimal(rates.rates.JPY.toString()),
      KRW: new Decimal(rates.rates.KRW.toString()),
      VND: new Decimal(rates.rates.VND.toString()),
    },
  })) as ExchangeRate[]

  if (mapped.length === 0) return transactions

  const indexed = transactions.map((t, index) => ({ t: { ...t }, index }))
  indexed.sort(
    (a, b) => new Date(a.t.date).getTime() - new Date(b.t.date).getTime()
  )

  let docIdx = 0
  let currentRates = mapped[0].rates

  const result: Transaction[] = new Array(transactions.length)

  for (const { t, index } of indexed) {
    const txDate = new Date(t.date)

    while (
      docIdx < mapped.length &&
      mapped[docIdx].date.getTime() <= txDate.getTime()
    ) {
      currentRates = mapped[docIdx].rates
      docIdx++
    }

    const convertedAmount = convertAmountWithRates(
      new Decimal(t.amount),
      t.currency,
      targetCurrency,
      currentRates
    )

    const stringifiedRates: Record<Currency, string> = {
      USD: currentRates.USD.toString(),
      CNY: currentRates.CNY.toString(),
      JPY: currentRates.JPY.toString(),
      KRW: currentRates.KRW.toString(),
      VND: currentRates.VND.toString(),
    }

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
