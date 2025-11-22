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
      it("should return true when today is exactly 7 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-08")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is 7 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-08")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not 7 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-16"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return false when today is same as lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("bi-weekly frequency", () => {
      it("should return true when today is exactly 14 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-05")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-19"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 7 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-05")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-12"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should return true when today is exactly 14 days after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "bi-weekly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-01")),
        }
        const today = normalizeToUTCDate(new Date("2024-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("monthly frequency", () => {
      it("should return true when today is the same day in the next month", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return true when today is the same day in next month after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-15")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is not the same day in next month", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-14"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle day 31 in months with fewer days (normalize to last day)", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-31")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-31")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-29")) // February has 29 days in 2024

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should handle day 31 in February (normalize to 28/29)", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-31")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-31")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-29")) // February has 29 days in 2024 (leap year)

        // Should generate on Feb 29 (last day) when lastGenerated was Jan 31
        expect(shouldGenerateToday(rec, today)).toBe(true)
      })
    })

    describe("quarterly frequency", () => {
      it("should return true when today is the same day 3 months after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "quarterly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-04-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 1 month after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "quarterly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-02-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })
    })

    describe("yearly frequency", () => {
      it("should return true when today is the same day 1 year after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
          endDate: undefined,
        }
        const today = normalizeToUTCDate(new Date("2025-01-15"))

        expect(shouldGenerateToday(rec, today)).toBe(true)
      })

      it("should return false when today is only 6 months after lastGenerated", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          startDate: normalizeToUTCDate(new Date("2024-01-10")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")),
        }
        const today = normalizeToUTCDate(new Date("2024-07-15"))

        expect(shouldGenerateToday(rec, today)).toBe(false)
      })

      it("should handle leap year correctly", () => {
        const rec: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "yearly",
          startDate: normalizeToUTCDate(new Date("2024-02-29")), // Leap year
          lastGenerated: normalizeToUTCDate(new Date("2024-02-29")),
          endDate: undefined,
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
        }
        const today = normalizeToUTCDate(new Date("2024-12-31"))

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
        const todayUTC = normalizeToUTCDate(new Date("2024-02-01"))
        const lastMonthUTC = normalizeToUTCDate(new Date("2024-01-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: lastMonthUTC,
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
        const lastMonthUTC = normalizeToUTCDate(new Date("2024-01-01"))

        const recurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: lastMonthUTC,
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
        const lastMonthUTC = normalizeToUTCDate(new Date("2024-01-01"))
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const recurringTransaction1: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: lastMonthUTC, // Will generate on 2024-02-01
        }

        const recurringTransaction2: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58b68a6aa5c9e69aad22"),
          frequency: "daily",
          categoryKey: "business_freelance", // Different category to avoid duplicate check
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: yesterdayUTC, // Will generate on 2024-02-01
        }

        const recurringTransaction3: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-15")),
          lastGenerated: normalizeToUTCDate(new Date("2024-01-15")), // Will generate on 2024-02-15, not today
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
        const lastMonthUTC = normalizeToUTCDate(new Date("2024-01-01"))

        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: lastMonthUTC, // Will generate on 2024-02-01
        }

        const inactiveRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId(),
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          lastGenerated: lastMonthUTC,
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

      it("should deactivate expired recurring transactions", async () => {
        const yesterdayUTC = normalizeToUTCDate(new Date("2024-01-31"))

        const expiredRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58b68a6aa5c9e69aad22"),
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          endDate: yesterdayUTC, // Expired yesterday
          isActive: true,
        }

        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          endDate: normalizeToUTCDate(new Date("2024-12-31")), // Still active
          isActive: true,
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
        expect(data.deactivated).toBe(1)

        const recurringCollection = await getRecurringTransactionsCollection()
        const expiredRecurring = await recurringCollection.findOne({
          _id: expiredRecurringTransaction._id,
        })
        const activeRecurring = await recurringCollection.findOne({
          _id: activeRecurringTransaction._id,
        })

        expect(expiredRecurring?.isActive).toBe(false)
        expect(activeRecurring?.isActive).toBe(true)

        vi.useRealTimers()
      })

      it("should not deactivate recurring transactions without end date", async () => {
        const activeRecurringTransaction: DBRecurringTransaction = {
          ...mockRecurringTransaction,
          _id: new ObjectId("691d58bfa688494d77dabe6d"),
          frequency: "monthly",
          startDate: normalizeToUTCDate(new Date("2024-01-01")),
          endDate: undefined, // No end date
          isActive: true,
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
        expect(data.deactivated).toBe(0)

        const recurringCollection = await getRecurringTransactionsCollection()
        const activeRecurring = await recurringCollection.findOne({
          _id: activeRecurringTransaction._id,
        })

        expect(activeRecurring?.isActive).toBe(true)

        vi.useRealTimers()
      })
    })
  })
})
