import type { DBRecurringTransaction } from "@/lib/definitions"
import { normalizeToUTCDate } from "@/lib/utils"

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function normalizeDay(year: number, month: number, day: number) {
  const last = getLastDayOfMonth(year, month)
  return Math.min(day, last)
}

function addDays(lastGeneratedUTC: Date, days: number) {
  return normalizeToUTCDate(
    new Date(lastGeneratedUTC.getTime() + days * 86400000)
  )
}

function nextWeeklyDate(lastGeneratedUTC: Date, weekday: number): Date {
  const cur = lastGeneratedUTC.getDay()
  let diff = weekday - cur
  if (diff <= 0) diff += 7
  return addDays(lastGeneratedUTC, diff)
}

function nextBiWeeklyDate(lastGeneratedUTC: Date, weekday: number): Date {
  const next = nextWeeklyDate(lastGeneratedUTC, weekday)
  const diff =
    (next.getTime() - lastGeneratedUTC.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 14) return addDays(next, 7)
  return next
}

function nextMonthlyDate(lastGeneratedUTC: Date, day: number): Date {
  const y = lastGeneratedUTC.getFullYear()
  const m = lastGeneratedUTC.getMonth() + 1
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, day)))
}

function nextQuarterlyDate(lastGeneratedUTC: Date, day: number): Date {
  const y = lastGeneratedUTC.getFullYear()
  const m = lastGeneratedUTC.getMonth() + 3
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, day)))
}

function nextYearlyDate(lastGeneratedUTC: Date, day: number): Date {
  const y = lastGeneratedUTC.getFullYear() + 1
  const m = lastGeneratedUTC.getMonth()
  return normalizeToUTCDate(new Date(y, m, normalizeDay(y, m, day)))
}

function getNextDate(rec: DBRecurringTransaction): Date {
  const lastGeneratedUTC = rec.lastGenerated
    ? normalizeToUTCDate(rec.lastGenerated)
    : normalizeToUTCDate(new Date())

  switch (rec.frequency) {
    case "daily":
      return addDays(lastGeneratedUTC, 1)

    case "weekly":
      return nextWeeklyDate(lastGeneratedUTC, rec.weekday!)

    case "bi-weekly":
      return nextBiWeeklyDate(lastGeneratedUTC, rec.weekday!)

    case "monthly":
      return nextMonthlyDate(lastGeneratedUTC, rec.dayOfMonth!)

    case "quarterly":
      return nextQuarterlyDate(lastGeneratedUTC, rec.dayOfMonth!)

    case "yearly":
      return nextYearlyDate(lastGeneratedUTC, rec.dayOfMonth!)

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
) {
  const startUTC = normalizeToUTCDate(rec.startDate)

  if (todayUTC.getTime() < startUTC.getTime()) return false
  if (
    rec.endDate &&
    todayUTC.getTime() > normalizeToUTCDate(rec.endDate).getTime()
  )
    return false

  const nextDate = getNextDate(rec)
  return isSameDate(nextDate, todayUTC)
}
