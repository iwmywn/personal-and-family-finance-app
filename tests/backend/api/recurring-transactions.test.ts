import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"

import {
  insertTestRecurringTransaction,
  insertTestTransaction,
} from "@/tests/backend/helpers/database"
import { mockRecurringTransaction } from "@/tests/shared/data"
import {
  getRecurringTransactionsCollection,
  getTransactionsCollection,
} from "@/lib/collections"
import type { DBRecurringTransaction, DBTransaction } from "@/lib/definitions"
import { normalizeToUTCDate } from "@/lib/utils"
import { GET } from "@/app/api/(cronjobs)/recurring-transactions/route"
import { shouldGenerateToday } from "@/app/api/(cronjobs)/recurring-transactions/utils"

const cronSecret = "test-cron-secret"
const cronEndpoint = "http://localhost/api/recurring-transactions"

describe("Recurring Transactions", () => {
  describe("shouldGenerateToday", () => {
    describe("daily frequency", () => {
      it("should return false when today is before start date", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-09"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return true when today is start date with no lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-10"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is next day after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is same as lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return false when today is after end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          endDate: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("weekly frequency", () => {
      it("should return true when today is the next weekday after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          weekday: 1, // Monday
          startDate: normalizeToUTCDate(new Date("2024-01-10")), // Wednesday
          lastGenerated: normalizeToUTCDate(new Date("2024-01-08")), // Monday (previous week)
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-15")) // Monday

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is the weekday and lastGenerated was last week", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          weekday: 1, // Monday
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-08")), // Monday
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-15")) // Monday

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not the weekday", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          weekday: 1, // Monday
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")), // Monday
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-16")) // Tuesday

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return false when today is same weekday as lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          weekday: 1, // Monday
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")), // Monday
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-15")) // Monday

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("bi-weekly frequency", () => {
      it("should return true when today is exactly 2 weeks after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          weekday: 5, // Friday
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-05")), // Friday
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-19")) // Friday, 2 weeks later

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 1 week after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          weekday: 5, // Friday
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-05")), // Friday
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-12")) // Friday, 1 week later

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return true when today is the weekday and 2+ weeks after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          weekday: 1, // Monday
          startDate: normalizeToUTCDate(new Date("2024-01-01")), // Monday
          lastGenerated: normalizeToUTCDate(new Date("2024-01-01")), // Monday, 2 weeks before today
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-15")) // Monday, 2 weeks later

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("monthly frequency", () => {
      it("should return true when today is the dayOfMonth in the next month", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is the dayOfMonth in next month after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-15")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not the dayOfMonth", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-14"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle day 31 in months with fewer days (normalize to last day)", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 31,
          startDate: normalizeToUTCDate(new Date("2024-01-31")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-31")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-29")) // February has 29 days in 2024

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should handle day 31 in February (normalize to 28/29)", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 31,
          startDate: normalizeToUTCDate(new Date("2024-01-31")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-31")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-29")) // February has 29 days in 2024 (leap year)

        // Should generate on Feb 29 (last day) when dayOfMonth is 31
        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("quarterly frequency", () => {
      it("should return true when today is the dayOfMonth 3 months after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "quarterly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-04-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 1 month after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "quarterly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("yearly frequency", () => {
      it("should return true when today is the dayOfMonth 1 year after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          endDate: undefined,
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2025-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 6 months after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          dayOfMonth: 15,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-07-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle leap year correctly", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          dayOfMonth: 29,
          startDate: normalizeToUTCDate(new Date("2024-02-29")), // Leap year
          lastGenerated: normalizeToUTCDate(new Date("2024-02-29")),
          endDate: undefined,
          weekday: undefined,
        }
        const today = normalizeToUTCDate(new Date("2025-02-28")) // Non-leap year, should normalize to 28

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("random frequency", () => {
      it("should return true when today is exactly randomEveryXDays after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "random",
          randomEveryXDays: 5,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-20"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is less than randomEveryXDays after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "random",
          randomEveryXDays: 5,
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-19"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("edge cases", () => {
      it("should return false when today is exactly on end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          endDate: normalizeToUTCDate(new Date("2024-01-15")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-14")),
          weekday: undefined,
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        // Should generate on end date if it's the next date
        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is one day after end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          endDate: normalizeToUTCDate(new Date("2024-01-15")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          weekday: undefined,
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle recurring transaction without end date", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "daily",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          endDate: undefined,
          lastGenerated: normalizeToUTCDate(new Date("2024-12-30")),
          weekday: undefined,
          dayOfMonth: undefined,
        }
        const today = normalizeToUTCDate(new Date("2024-12-31"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should handle different weekdays correctly", () => {
        // Test all weekdays (0 = Sunday, 6 = Saturday)
        for (let weekday = 0; weekday <= 6; weekday++) {
          // Find the next occurrence of this weekday from start date
          const startDate = new Date("2024-01-01")
          const startWeekday = startDate.getDay()
          let daysToAdd = weekday - startWeekday
          if (daysToAdd <= 0) daysToAdd += 7
          const nextDate = new Date(startDate)
          nextDate.setDate(startDate.getDate() + daysToAdd)
          const lastGenerated = normalizeToUTCDate(nextDate)

          // Set lastGenerated to the first occurrence, then test the next week
          const nextWeekDate = new Date(nextDate)
          nextWeekDate.setDate(nextDate.getDate() + 7)
          const today = normalizeToUTCDate(nextWeekDate)

          const rec: DBRecurringTransaction = {
            ...mockRecurringTransaction,
            frequency: "weekly",
            weekday: weekday,
            startDate: normalizeToUTCDate(new Date("2024-01-01")), // Monday
            lastGenerated: lastGenerated,
            dayOfMonth: undefined,
          }

          expect(shouldGenerateToday(rec, today)).toBe(true)
        }
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
        const todayUTC = normalizeToUTCDate(new Date("2024-02-01"))
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 1,
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
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

        expect(updatedRecurring?.lastGenerated).toEqual(todayUTC)

        vi.useRealTimers()
      })

      it("should skip transaction when shouldGenerateToday returns false", async () => {
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-02-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 1, // Should generate on 1st, but today is 2nd
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
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
        const todayUTC = normalizeToUTCDate(new Date("2024-02-01"))
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 1,
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
        }

        await insertTestRecurringTransaction(recurringTransaction)

        const existingTransaction: DBTransaction = {
          _id: new ObjectId(),
          userId: recurringTransaction.userId,
          type: recurringTransaction.type,
          categoryKey: recurringTransaction.categoryKey,
          amount: recurringTransaction.amount,
          description: recurringTransaction.description,
          date: todayUTC,
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

        expect(updatedRecurring?.lastGenerated).toEqual(todayUTC)

        vi.useRealTimers()
      })

      it("should handle multiple recurring transactions correctly", async () => {
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const recurringTransaction1: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 1,
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
        }

        const recurringTransaction2: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58b68a6aa5c9e69aad22"),
          frequency: "daily",
          categoryKey: "business_freelance", // Different category to avoid duplicate check
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
        }

        const recurringTransaction3: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          dayOfMonth: 15, // Should not generate today
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
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
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          dayOfMonth: 1,
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
        }

        const inactiveRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId(),
          frequency: "monthly",
          dayOfMonth: 1,
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC,
          isActive: false,
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
    })
  })
})
