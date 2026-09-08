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

function addDays(lastGeneratedDateUTC: Date, days: number): Date {
  return new Date(lastGeneratedDateUTC.getTime() + days * 86400000)
}

function nextMonthlyDate(lastGeneratedDateUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear()
  const m = lastGeneratedDateUTC.getUTCMonth() + 1
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedDateUTC.getUTCDate()
  )
  return new Date(Date.UTC(y, m, normalizeDay(y, m, targetDay)))
}

function nextQuarterlyDate(
  lastGeneratedDateUTC: Date,
  startDateUTC: Date
): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear()
  const m = lastGeneratedDateUTC.getUTCMonth() + 3
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedDateUTC.getUTCDate()
  )
  return new Date(Date.UTC(y, m, normalizeDay(y, m, targetDay)))
}

function nextYearlyDate(lastGeneratedDateUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear() + 1
  const targetMonth = startDateUTC.getUTCMonth()
  const targetDay = Math.max(
    startDateUTC.getUTCDate(),
    lastGeneratedDateUTC.getUTCDate()
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
  if (!rec.lastGeneratedDate) {
    // if we've missed the start date, return today
    if (todayUTC > startDate) {
      return new Date(todayUTC.getTime())
    }
    return startDate
  }

  const lastGeneratedDateUTC = new Date(rec.lastGeneratedDate)

  let nextDate: Date
  switch (rec.frequency) {
    case "daily":
      nextDate = addDays(lastGeneratedDateUTC, 1)
      break

    case "weekly":
      nextDate = addDays(lastGeneratedDateUTC, 7)
      break

    case "bi-weekly":
      nextDate = addDays(lastGeneratedDateUTC, 14)
      break

    case "monthly":
      nextDate = nextMonthlyDate(lastGeneratedDateUTC, startDate)
      break

    case "quarterly":
      nextDate = nextQuarterlyDate(lastGeneratedDateUTC, startDate)
      break

    case "yearly":
      nextDate = nextYearlyDate(lastGeneratedDateUTC, startDate)
      break

    case "random":
      nextDate = addDays(lastGeneratedDateUTC, rec.randomEveryXDays!)
      break
  }

  // if we've missed the next date, return today
  // (e.g., when recurring transaction was deactivated and then reactivated)
  if (todayUTC > nextDate) {
    return new Date(todayUTC.getTime())
  }

  return nextDate
}

function isSameDate(a: Date, b: Date): boolean {
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
