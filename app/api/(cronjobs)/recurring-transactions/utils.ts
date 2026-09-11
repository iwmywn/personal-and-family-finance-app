import { addDays, clampDayToMonth, isSameUTCDate } from "@/lib/date"
import type {
  DBRecurringTransaction,
  RecurringTransaction,
} from "@/lib/definitions"

function nextMonthlyDate(lastGeneratedDateUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear()
  const m = lastGeneratedDateUTC.getUTCMonth() + 1
  const targetDay = startDateUTC.getUTCDate()
  return new Date(Date.UTC(y, m, clampDayToMonth(y, m + 1, targetDay)))
}

function nextQuarterlyDate(
  lastGeneratedDateUTC: Date,
  startDateUTC: Date
): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear()
  const m = lastGeneratedDateUTC.getUTCMonth() + 3
  const targetDay = startDateUTC.getUTCDate()
  return new Date(Date.UTC(y, m, clampDayToMonth(y, m + 1, targetDay)))
}

function nextYearlyDate(lastGeneratedDateUTC: Date, startDateUTC: Date): Date {
  const y = lastGeneratedDateUTC.getUTCFullYear() + 1
  const targetMonth = startDateUTC.getUTCMonth()
  const targetDay = startDateUTC.getUTCDate()
  return new Date(
    Date.UTC(y, targetMonth, clampDayToMonth(y, targetMonth + 1, targetDay))
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

    case "random": {
      const days =
        typeof rec.randomEveryXDays === "number" && rec.randomEveryXDays >= 1
          ? rec.randomEveryXDays
          : 1
      nextDate = addDays(lastGeneratedDateUTC, days)
      break
    }
  }

  // if we've missed the next date, return today
  // (e.g., when recurring transaction was deactivated and then reactivated)
  if (todayUTC > nextDate) {
    return new Date(todayUTC.getTime())
  }

  return nextDate
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

  return isSameUTCDate(nextDate, todayUTC)
}
