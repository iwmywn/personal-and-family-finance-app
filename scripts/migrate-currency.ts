import { Decimal128, MongoClient } from "mongodb"

import { CURRENCIES } from "../lib/currency.ts"

type ExchangeRateDoc = {
  date: Date
  rates?: Record<string, Decimal128>
}

type FrankfurterRateItem = {
  date: string
  // base: string
  quote: string
  rate: number
}

async function migrate() {
  const dbUri = process.env.DB_URI
  const dbName = process.env.DB_NAME

  if (!dbUri || !dbName) {
    console.error("Missing DB_URI or DB_NAME in .env file")
    process.exit(1)
  }

  const client = new MongoClient(dbUri)

  try {
    console.log("Starting exchange rate migration...")
    await client.connect()
    const collection = client
      .db(dbName)
      .collection<ExchangeRateDoc>("exchangeRates")

    const docs = await collection.find({}).sort({ date: 1 }).toArray()
    if (docs.length === 0) {
      console.log("No exchange rate records found in database to migrate.")
      return
    }

    const nonUSDCurrencies = CURRENCIES.filter((c) => c !== "USD")
    const missingCurrencies = nonUSDCurrencies.filter((curr) =>
      docs.some((doc) => !doc.rates || doc.rates[curr] === undefined)
    )

    if (missingCurrencies.length === 0) {
      console.log("All currencies in CURRENCIES are up to date!")
      return
    }

    console.log(`Missing currencies found: ${missingCurrencies.join(", ")}`)

    const fromDate = docs[0].date.toISOString().split("T")[0]
    const toDate = docs[docs.length - 1].date.toISOString().split("T")[0]
    console.log(`Fetching exchange rates from ${fromDate} to ${toDate}...`)

    const url = `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${missingCurrencies.join(",")}&from=${fromDate}&to=${toDate}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Frankfurter API error: ${response.status} ${response.statusText}`
      )
    }

    const ratesData = (await response.json()) as FrankfurterRateItem[]

    const bulkOps = ratesData.map((item) => ({
      updateOne: {
        filter: { date: new Date(`${item.date}T00:00:00.000Z`) },
        update: {
          $set: {
            [`rates.${item.quote}`]: Decimal128.fromString(
              item.rate.toString()
            ),
          },
        },
      },
    }))

    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps)
      console.log(
        `Successfully updated ${result.modifiedCount} exchange rate records.`
      )
    }
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await client.close()
  }
}

migrate()
