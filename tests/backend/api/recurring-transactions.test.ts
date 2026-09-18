import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

import {
  insertTestRecurringTransaction,
  insertTestTransaction,
} from "@/tests/backend/helpers/database"
import { mockDBRecurringTransaction } from "@/tests/shared/data"
import { GET } from "@/app/api/(cronjobs)/recurring-transactions/route"
import {
  getDueDates,
  shouldGenerateToday,
} from "@/app/api/(cronjobs)/recurring-transactions/utils"
import {
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import { localDateToUTCMidnight } from "@/lib/date"
import type { DBRecurringTransaction, DBTransaction } from "@/lib/definitions"

const cronSecret = "test-cron-secret"
const cronEndpoint = "http://localhost/api/recurring-transactions"

describe("Recurring Transactions Cron Job", () => {
  describe("shouldGenerateToday", () => {
    describe("daily frequency", () => {
      it("should return false when today is before start date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-09"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return true when today is start date with no lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: undefined,
        }
        const today = localDateToUTCMidnight(new Date("2024-01-10"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is next day after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is same as lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return false when today is after end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          endDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("weekly frequency", () => {
      it("should return true when today is exactly 7 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-08")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is 7 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-08")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not 7 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return false when today is same as lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("bi-weekly frequency", () => {
      it("should return true when today is exactly 14 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "bi-weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-05")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-19"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 7 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "bi-weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-05")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-12"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return true when today is exactly 14 days after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "bi-weekly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-01")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("monthly frequency", () => {
      it("should return true when today is the same day in the next month", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is the same day in next month after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not the same day in next month", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-14"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle day 31 in months with fewer days (normalize to last day)", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-31")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-31")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-29")) // February has 29 days in 2024

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should handle day 31 in February (normalize to 28/29)", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-31")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-31")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-29")) // February has 29 days in 2024 (leap year)

        // Should generate on Feb 29 (last day) when lastGeneratedDate was Jan 31
        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should maintain anchor day from startDate even if previous month normalized to shorter day", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-31")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-02-29")),
        }
        const today = localDateToUTCMidnight(new Date("2024-03-31"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should not drift day if lastGeneratedDate differs from startDate day", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-20")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-10"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should catch up schedule when lastGeneratedDate is multiple months in the past", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-10")),
        }
        const today = localDateToUTCMidnight(new Date("2024-04-10"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false on non-cadence day even when lastGeneratedDate is multiple months in past", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-10")),
        }
        const today = localDateToUTCMidnight(new Date("2024-04-18"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle year boundary transition from December to January", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-12-15")),
          endDate: undefined,
        }
        const today = localDateToUTCMidnight(new Date("2025-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should reset cycle to startDate if lastGeneratedDate is before updated startDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-06-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-01")),
        }
        const today = localDateToUTCMidnight(new Date("2024-06-01"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("quarterly frequency", () => {
      it("should return true when today is the same day 3 months after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "quarterly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-04-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 1 month after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "quarterly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("yearly frequency", () => {
      it("should return true when today is the same day 1 year after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "yearly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
          endDate: undefined,
        }
        const today = localDateToUTCMidnight(new Date("2025-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 6 months after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "yearly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-07-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle leap year correctly", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "yearly",
          startDate: localDateToUTCMidnight(new Date("2024-02-29")), // Leap year
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-02-29")),
          endDate: undefined,
        }
        const today = localDateToUTCMidnight(new Date("2025-02-28")) // Non-leap year, should normalize to 28

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("random frequency", () => {
      it("should return true when today is exactly randomEveryXDays after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "random",
          randomEveryXDays: 5,
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-20"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is less than randomEveryXDays after lastGeneratedDate", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "random",
          randomEveryXDays: 5,
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-19"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("edge cases", () => {
      it("should return false when today is exactly on end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          endDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-14")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-15"))

        // Should generate on end date if it's the next date
        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is one day after end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          endDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")),
        }
        const today = localDateToUTCMidnight(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle recurring transaction without end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-01-10")),
          endDate: undefined,
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-12-30")),
        }
        const today = localDateToUTCMidnight(new Date("2024-12-31"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })
  })

  describe("Cron Job Route", () => {
    describe("Authorization", () => {
      it("should return 401 when authorization header is missing", async () => {
        const request = new NextRequest(cronEndpoint)

        const response = await GET(request)
        const text = await response.text()

        expect(response.status).toBe(401)
        expect(text).toBe("Unauthorized")
      })

      it("should return 401 when authorization header is invalid", async () => {
        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: "Bearer wrong-secret",
          },
        })

        const response = await GET(request)
        const text = await response.text()

        expect(response.status).toBe(401)
        expect(text).toBe("Unauthorized")
      })

      it("should return 401 when authorization header format is wrong", async () => {
        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Invalid ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const text = await response.text()

        expect(response.status).toBe(401)
        expect(text).toBe("Unauthorized")
      })
    })

    describe("Successful execution", () => {
      it("should create transaction when recurring transaction should generate today", async () => {
        const todayUTC = localDateToUTCMidnight(new Date("2024-02-01"))
        const lastMonthUTC = localDateToUTCMidnight(new Date("2024-01-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: lastMonthUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(1)
        expect(data.createdIds).toHaveLength(1)
        expect(data.skippedCount).toBe(0)
        expect(data.skippedReason).toHaveLength(0)

        const transactionsCollection = await getTransactionsCollection()
        const createdTransaction = await transactionsCollection.findOne({
          userId: recurringTransaction.userId,
          type: recurringTransaction.type,
          categoryKey: recurringTransaction.categoryKey,
          amount: recurringTransaction.amount,
          date: todayUTC,
        })

        expect(createdTransaction).toBeDefined()
        expect(createdTransaction?.description).toBe(
          recurringTransaction.description
        )

        const recurringCollection = await getRecurringTransactionsCollection()
        const updatedRecurring = await recurringCollection.findOne({
          _id: recurringTransaction._id,
        })

        expect(updatedRecurring?.lastGeneratedDate).toEqual(todayUTC)

        vi.useRealTimers()
      })

      it("should skip transaction when shouldGenerateToday returns false", async () => {
        const yesterdayUTC = localDateToUTCMidnight(new Date("2024-02-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: yesterdayUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-02T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(0)
        expect(data.createdIds).toHaveLength(0)
        expect(data.skippedCount).toBe(1)
        expect(data.skippedReason).toHaveLength(1)
        expect(data.skippedReason[0]).toEqual({
          id: recurringTransaction._id.toString(),
          reason: "notToday",
        })

        const transactionsCollection = await getTransactionsCollection()
        const transactions = await transactionsCollection
          .find({ userId: recurringTransaction.userId })
          .toArray()

        expect(transactions).toHaveLength(0)

        vi.useRealTimers()
      })

      it("should skip transaction when duplicate already exists", async () => {
        const todayUTC = localDateToUTCMidnight(new Date("2024-02-01"))
        const lastMonthUTC = localDateToUTCMidnight(new Date("2024-01-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: lastMonthUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        const existingTransaction: DBTransaction = {
          _id: new ObjectId(),
          userId: recurringTransaction.userId,
          type: recurringTransaction.type,
          categoryKey: recurringTransaction.categoryKey,
          amount: recurringTransaction.amount,
          currency: recurringTransaction.currency,
          description: recurringTransaction.description,
          date: todayUTC,
          recurringId: recurringTransaction._id,
        }

        await insertTestTransaction(existingTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(0)
        expect(data.createdIds).toHaveLength(0)
        expect(data.skippedCount).toBe(1)
        expect(data.skippedReason).toHaveLength(1)
        expect(data.skippedReason[0]).toEqual({
          id: recurringTransaction._id.toString(),
          reason: "existing",
        })

        const transactionsCollection = await getTransactionsCollection()
        const transactions = await transactionsCollection
          .find({ userId: recurringTransaction.userId })
          .toArray()

        expect(transactions).toHaveLength(1)
        expect(transactions[0]._id.toString()).toBe(
          existingTransaction._id.toString()
        )

        const recurringCollection = await getRecurringTransactionsCollection()
        const updatedRecurring = await recurringCollection.findOne({
          _id: recurringTransaction._id,
        })

        expect(updatedRecurring?.lastGeneratedDate).toEqual(todayUTC)

        vi.useRealTimers()
      })

      it("should not skip recurring transaction when user created a manual transaction with identical attributes", async () => {
        const todayUTC = localDateToUTCMidnight(new Date("2024-02-01"))
        const lastMonthUTC = localDateToUTCMidnight(new Date("2024-01-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId(),
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: lastMonthUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        // Manual transaction with identical fields but without recurringId
        const manualTransaction: DBTransaction = {
          _id: new ObjectId(),
          userId: recurringTransaction.userId,
          type: recurringTransaction.type,
          categoryKey: recurringTransaction.categoryKey,
          amount: recurringTransaction.amount,
          currency: recurringTransaction.currency,
          description: recurringTransaction.description,
          date: todayUTC,
        }

        await insertTestTransaction(manualTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(1)
        expect(data.skippedCount).toBe(0)

        const transactionsCollection = await getTransactionsCollection()
        const transactions = await transactionsCollection
          .find({ userId: recurringTransaction.userId })
          .toArray()

        expect(transactions).toHaveLength(2)

        vi.useRealTimers()
      })

      it("should handle multiple recurring transactions correctly", async () => {
        const lastMonthUTC = localDateToUTCMidnight(new Date("2024-01-01"))
        const yesterdayUTC = localDateToUTCMidnight(new Date("2024-01-31"))

        const recurringTransaction1: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: lastMonthUTC, // Will generate on 2024-02-01
        }

        const recurringTransaction2: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58b68a6aa5c9e69aad22"),
          frequency: "daily",
          categoryKey: "business_freelance", // Different category to avoid duplicate check
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: yesterdayUTC, // Will generate on 2024-02-01
        }

        const recurringTransaction3: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-15")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-15")), // Will generate on 2024-02-15, not today
        }

        await insertTestRecurringTransaction(recurringTransaction1)
        await insertTestRecurringTransaction(recurringTransaction2)
        await insertTestRecurringTransaction(recurringTransaction3)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(2)
        expect(data.createdIds).toHaveLength(2)
        expect(data.skippedCount).toBe(1)
        expect(data.skippedReason).toHaveLength(1)
        expect(data.skippedReason[0].reason).toBe("notToday")

        const transactionsCollection = await getTransactionsCollection()
        const transactions = await transactionsCollection
          .find({ userId: recurringTransaction1.userId })
          .toArray()

        expect(transactions).toHaveLength(2)
        expect(data.createdIds).toContain(transactions[0]._id.toString())
        expect(data.createdIds).toContain(transactions[1]._id.toString())

        vi.useRealTimers()
      })

      it("should only process active recurring transactions", async () => {
        const lastMonthUTC = localDateToUTCMidnight(new Date("2024-01-01"))

        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: lastMonthUTC, // Will generate on 2024-02-01
        }

        const inactiveRecurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId(),
          description: "Inactive Monthly Salary",
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          endDate: localDateToUTCMidnight(new Date("2024-01-15")), // Expired
          lastGeneratedDate: lastMonthUTC,
        }

        await insertTestRecurringTransaction(activeRecurringTransaction)
        await insertTestRecurringTransaction(inactiveRecurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(1)

        const transactionsCollection = await getTransactionsCollection()
        const transactions = await transactionsCollection
          .find({ userId: activeRecurringTransaction.userId })
          .toArray()

        expect(transactions).toHaveLength(1)
        expect(transactions[0].userId.toString()).toBe(
          activeRecurringTransaction.userId.toString()
        )

        vi.useRealTimers()
      })
    })

    describe("Edge cases", () => {
      it("should handle empty recurring transactions list", async () => {
        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(0)
        expect(data.createdIds).toHaveLength(0)
        expect(data.skippedCount).toBe(0)
        expect(new Date(data.timestamp).getTime()).toBeLessThanOrEqual(
          Date.now()
        )
      })

      it("should not process expired recurring transactions whose endDate has passed", async () => {
        const yesterdayUTC = localDateToUTCMidnight(new Date("2024-01-31"))

        const expiredRecurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58b68a6aa5c9e69aad22"),
          description: "Expired Monthly Salary",
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          endDate: yesterdayUTC, // Expired yesterday
        }

        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-01")),
          endDate: localDateToUTCMidnight(new Date("2024-12-31")), // Still active
        }

        await insertTestRecurringTransaction(expiredRecurringTransaction)
        await insertTestRecurringTransaction(activeRecurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(1)

        const transactionsCollection = await getTransactionsCollection()
        const expiredTx = await transactionsCollection.findOne({
          description: "Expired Monthly Salary",
        })
        const activeTx = await transactionsCollection.findOne({
          description: "Monthly Salary",
        })

        expect(expiredTx).toBeNull()
        expect(activeTx).toBeDefined()

        vi.useRealTimers()
      })

      it("should process recurring transactions without end date", async () => {
        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: localDateToUTCMidnight(new Date("2024-01-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-01-01")),
          endDate: undefined, // No end date
        }

        await insertTestRecurringTransaction(activeRecurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-01T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(1)

        vi.useRealTimers()
      })

      it("should backfill missed occurrences and attach recurringId when cron was delayed", async () => {
        const startDateUTC = localDateToUTCMidnight(new Date("2024-02-01"))
        const lastGeneratedDateUTC = localDateToUTCMidnight(
          new Date("2024-02-01")
        )
        const recurringTransaction: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe7e"),
          frequency: "daily",
          startDate: startDateUTC,
          lastGeneratedDate: lastGeneratedDateUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        vi.useFakeTimers()
        vi.setSystemTime(new Date("2024-02-03T12:00:00.000Z"))

        const request = new NextRequest(cronEndpoint, {
          headers: {
            authorization: `Bearer ${cronSecret}`,
          },
        })

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.created).toBe(2)

        const transactionsCollection = await getTransactionsCollection()
        const createdTxs = await transactionsCollection
          .find({ userId: recurringTransaction.userId })
          .sort({ date: 1 })
          .toArray()

        expect(createdTxs).toHaveLength(2)
        expect(createdTxs[0].recurringId?.toString()).toBe(
          recurringTransaction._id.toString()
        )
        expect(createdTxs[1].recurringId?.toString()).toBe(
          recurringTransaction._id.toString()
        )
        expect(createdTxs[0].date).toEqual(
          localDateToUTCMidnight(new Date("2024-02-02"))
        )
        expect(createdTxs[1].date).toEqual(
          localDateToUTCMidnight(new Date("2024-02-03"))
        )

        const recurringCollection = await getRecurringTransactionsCollection()
        const updatedRec = await recurringCollection.findOne({
          _id: recurringTransaction._id,
        })
        expect(updatedRec?.lastGeneratedDate).toEqual(
          localDateToUTCMidnight(new Date("2024-02-03"))
        )

        vi.useRealTimers()
      })
    })

    describe("getDueDates", () => {
      it("should return empty array when today is before start date", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-02-10")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-09"))
        expect(getDueDates(rec, today)).toEqual([])
      })

      it("should return [todayUTC] when today is start date with no lastGeneratedDate", () => {
        const today = localDateToUTCMidnight(new Date("2024-02-10"))
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: today,
          lastGeneratedDate: undefined,
        }
        expect(getDueDates(rec, today)).toEqual([today])
      })

      it("should return empty array when lastGeneratedDate is already today", () => {
        const today = localDateToUTCMidnight(new Date("2024-02-10"))
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-02-01")),
          lastGeneratedDate: today,
        }
        expect(getDueDates(rec, today)).toEqual([])
      })

      it("should backfill all missed daily occurrences up to today", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-02-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-02-01")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-04"))
        const dueDates = getDueDates(rec, today)

        expect(dueDates).toEqual([
          localDateToUTCMidnight(new Date("2024-02-02")),
          localDateToUTCMidnight(new Date("2024-02-03")),
          localDateToUTCMidnight(new Date("2024-02-04")),
        ])
      })

      it("should not exceed endDate when backfilling", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-02-01")),
          lastGeneratedDate: localDateToUTCMidnight(new Date("2024-02-01")),
          endDate: localDateToUTCMidnight(new Date("2024-02-02")),
        }
        const today = localDateToUTCMidnight(new Date("2024-02-04"))
        const dueDates = getDueDates(rec, today)

        expect(dueDates).toEqual([
          localDateToUTCMidnight(new Date("2024-02-02")),
        ])
      })

      it("should backfill from startDate when lastGeneratedDate is not set", () => {
        const rec: DBRecurringTransaction = {
          ...mockDBRecurringTransaction,
          frequency: "daily",
          startDate: localDateToUTCMidnight(new Date("2024-02-01")),
          lastGeneratedDate: undefined,
        }
        const today = localDateToUTCMidnight(new Date("2024-02-04"))
        const dueDates = getDueDates(rec, today)

        expect(dueDates).toEqual([
          localDateToUTCMidnight(new Date("2024-02-01")),
          localDateToUTCMidnight(new Date("2024-02-02")),
          localDateToUTCMidnight(new Date("2024-02-03")),
          localDateToUTCMidnight(new Date("2024-02-04")),
        ])
      })
    })
  })
})
