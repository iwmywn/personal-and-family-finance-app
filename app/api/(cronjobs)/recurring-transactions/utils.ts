import type { DBRecurringTransaction } from "@/lib/definitions"
import { normalizeToUTCDate } from "@/lib/utils"

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
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
  const y = lastGeneratedUTC.getFullYear()
  const m = lastGeneratedUTC.getMonth() + 1
  const d = lastGeneratedUTC.getDate()
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, d)))
}

function nextQuarterlyDate(lastGeneratedUTC: Date): Date {
  const y = lastGeneratedUTC.getFullYear()
  const m = lastGeneratedUTC.getMonth() + 3
  const d = lastGeneratedUTC.getDate()
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, d)))
}

function nextYearlyDate(lastGeneratedUTC: Date): Date {
  const y = lastGeneratedUTC.getFullYear() + 1
  const m = lastGeneratedUTC.getMonth()
  const d = lastGeneratedUTC.getDate()
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, d)))
}

function getNextDate(rec: DBRecurringTransaction): Date {
  // if no last generated date, return the start date
  if (!rec.lastGenerated) {
    return normalizeToUTCDate(rec.startDate)
  }

  const lastGeneratedUTC = normalizeToUTCDate(rec.lastGenerated)

  switch (rec.frequency) {
    case "daily":
      return addDays(lastGeneratedUTC, 1)

    case "weekly":
      return addDays(lastGeneratedUTC, 7)

    case "bi-weekly":
      return addDays(lastGeneratedUTC, 14)

    case "monthly":
      return nextMonthlyDate(lastGeneratedUTC)

    case "quarterly":
      return nextQuarterlyDate(lastGeneratedUTC)

    case "yearly":
      return nextYearlyDate(lastGeneratedUTC)

    case "random":
      return addDays(lastGeneratedUTC, rec.randomEveryXDays!)
  }
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
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

  const nextDate = getNextDate(rec)

  return isSameDate(nextDate, todayUTC)
}
