import type {
  DBRecurringTransaction,
  RecurringTransaction,
} from "@/lib/definitions"

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

function normalizeDay(year: number, month: number, day: number): number {
  const last = getLastDayOfMonth(year, month)
  return Math.min(day, last)
}

function addDays(lastGeneratedUTC: Date, days: number): Date {
  return new Date(lastGeneratedUTC.getTime() + days * 86400000)
}

function nextMonthlyDate(lastGeneratedUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear()
  const m = lastGeneratedUTC.getUTCMonth() + 1
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedUTC.getUTCDate()
  )
  return new Date(Date.UTC(y, m, normalizeDay(y, m, targetDay)))
}

function nextQuarterlyDate(lastGeneratedUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear()
  const m = lastGeneratedUTC.getUTCMonth() + 3
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedUTC.getUTCDate()
  )
  return new Date(Date.UTC(y, m, normalizeDay(y, m, targetDay)))
}

function nextYearlyDate(lastGeneratedUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedUTC.getUTCFullYear() + 1
  const targetMonth = startDateUTC.getUTCMonth()
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedUTC.getUTCDate()
  )
  return new Date(
    Date.UTC(y, targetMonth, normalizeDay(y, targetMonth, targetDay))
  )
}

export function getNextDate(
  rec: DBRecurringTransaction | RecurringTransaction,
  todayUTC: Date
): Date {
  const startDate = new Date(rec.startDate)

  // if no last generated date, return the start date
  if (!rec.lastGenerated) {
    // if we've missed the start date, return today
    if (todayUTC > startDate) {
      return new Date(todayUTC.getTime())
    }
    return startDate
  }

  const lastGeneratedUTC = new Date(rec.lastGenerated)

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
      nextDate = nextMonthlyDate(lastGeneratedUTC, startDate)
      break

    case "quarterly":
      nextDate = nextQuarterlyDate(lastGeneratedUTC, startDate)
      break

    case "yearly":
      nextDate = nextYearlyDate(lastGeneratedUTC, startDate)
      break

    case "random":
      nextDate = addDays(lastGeneratedUTC, rec.randomEveryXDays!)
      break
  }

  // if we've missed the next date, return today
  // (e.g., when recurring transaction was deactivated and then reactivated)
  if (todayUTC > nextDate) {
    return new Date(todayUTC.getTime())
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
  const startUTC = new Date(rec.startDate)
  const endUTC = rec.endDate ? new Date(rec.endDate) : null

  if (todayUTC < startUTC || (endUTC && todayUTC > endUTC)) {
    return false
  }

  const nextDate = getNextDate(rec, todayUTC)

  return isSameDate(nextDate, todayUTC)
}
