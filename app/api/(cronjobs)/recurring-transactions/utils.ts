import type {
  DBRecurringTransaction,
  RecurringTransaction,
} from "@/lib/definitions"
import { normalizeToUTCDate } from "@/lib/utils"

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

function normalizeDay(year: number, month: number, day: number): number {
  const last = getLastDayOfMonth(year, month)
  return Math.min(day, last)
}

function addDays(lastGeneratedUTC: Date, days: number) {
  return normalizeToUTCDate(
    new Date(lastGeneratedUTC.getTime() + days * 86400000)
  )
}

function nextMonthlyDate(lastGeneratedUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear()
  const m = lastGeneratedUTC.getUTCMonth() + 1
  const d = lastGeneratedUTC.getUTCDate()
  return new Date(Date.UTC(y, m, normalizeDay(y, m, d)))
}

function nextQuarterlyDate(lastGeneratedUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear()
  const m = lastGeneratedUTC.getUTCMonth() + 3
  const d = lastGeneratedUTC.getUTCDate()
  return new Date(Date.UTC(y, m, normalizeDay(y, m, d)))
}

function nextYearlyDate(lastGeneratedUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear() + 1
  const m = lastGeneratedUTC.getUTCMonth()
  const d = lastGeneratedUTC.getUTCDate()
  return new Date(Date.UTC(y, m, normalizeDay(y, m, d)))
}

export function getNextDate(
  rec: DBRecurringTransaction | RecurringTransaction,
  todayUTC: Date
): Date {
  // if no last generated date, return the start date
  if (!rec.lastGenerated) {
    const startDate = normalizeToUTCDate(rec.startDate)
    // if we've missed the start date, return today
    if (todayUTC > startDate) {
      return normalizeToUTCDate(todayUTC)
    }
    return startDate
  }

  const lastGeneratedUTC = normalizeToUTCDate(rec.lastGenerated)

  let nextDate: Date
  switch (rec.frequency) {
    case "daily":
      nextDate = addDays(lastGeneratedUTC, 1)
      break

    case "weekly":
      nextDate = addDays(lastGeneratedUTC, 7)
      break

    case "bi-weekly":
      nextDate = addDays(lastGeneratedUTC, 14)
      break

    case "monthly":
      nextDate = nextMonthlyDate(lastGeneratedUTC)
      break

    case "quarterly":
      nextDate = nextQuarterlyDate(lastGeneratedUTC)
      break

    case "yearly":
      nextDate = nextYearlyDate(lastGeneratedUTC)
      break

    case "random":
      nextDate = addDays(lastGeneratedUTC, rec.randomEveryXDays!)
      break
  }

  // if we've missed the next date, return today
  // (e.g., when recurring transaction was deactivated and then reactivated)
  if (todayUTC > nextDate) {
    return normalizeToUTCDate(todayUTC)
  }

  return nextDate
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

export function shouldGenerateToday(
  rec: DBRecurringTransaction,
  todayUTC: Date
): boolean {
  const startUTC = normalizeToUTCDate(rec.startDate)
  const endUTC = rec.endDate ? normalizeToUTCDate(rec.endDate) : null

  if (todayUTC < startUTC || (endUTC && todayUTC > endUTC)) {
    return false
  }

  const nextDate = getNextDate(rec, todayUTC)

  return isSameDate(nextDate, todayUTC)
}
