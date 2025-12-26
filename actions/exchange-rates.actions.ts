"use server"

import Decimal from "decimal.js"
import type { Decimal128 } from "mongodb"

import { getExchangeRatesCollection } from "@/lib/collections"
import { type AppCurrency } from "@/lib/currency"
import type { ExchangeRate, Transaction } from "@/lib/definitions"

export type RawRates = Record<Exclude<AppCurrency, "USD">, Decimal128>
export type ExchangeRates = Record<AppCurrency, Decimal>

function convertAmountWithRates(
  amount: Decimal,
  from: AppCurrency,
  to: AppCurrency,
  rates: ExchangeRates
): Decimal {
  if (from === to) return amount

  const amountInUSD = from === "USD" ? amount : amount.dividedBy(rates[from])

  const result = to === "USD" ? amountInUSD : amountInUSD.mul(rates[to])

  return result
}

export async function convertTransactionsToCurrency(
  transactions: Transaction[],
  targetCurrency: AppCurrency
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

    result[index] = {
      ...t,
      amount: convertedAmount.toString(),
      currency: targetCurrency,
    }
  }

  return result
}
