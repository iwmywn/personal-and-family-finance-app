import {
  addDays,
  clampDayToMonth,
  isSameUTCDate,
  normalizeToUTCMidnight,
} from "@/lib/date"
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

function stepNextDate(
  currentUTC: Date,
  frequency: DBRecurringTransaction["frequency"],
  startDateUTC: Date,
  randomEveryXDays?: number
): Date {
  switch (frequency) {
    case "daily":
      return addDays(currentUTC, 1)

    case "weekly":
      return addDays(currentUTC, 7)

    case "bi-weekly":
      return addDays(currentUTC, 14)

    case "monthly":
      return nextMonthlyDate(currentUTC, startDateUTC)

    case "quarterly":
      return nextQuarterlyDate(currentUTC, startDateUTC)

    case "yearly":
      return nextYearlyDate(currentUTC, startDateUTC)

    case "random": {
      const days =
        typeof randomEveryXDays === "number" && randomEveryXDays >= 1
          ? randomEveryXDays
          : 1
      return addDays(currentUTC, days)
    }
  }
}

export function getNextDate(
  rec: DBRecurringTransaction | RecurringTransaction,
  todayUTC: Date
): Date {
  const startDate = new Date(rec.startDate)

  // if no last generated date, step forward from start date until >= todayUTC
  if (!rec.lastGeneratedDate) {
    let candidate = startDate
    while (candidate < todayUTC && !isSameUTCDate(candidate, todayUTC)) {
      candidate = stepNextDate(
        candidate,
        rec.frequency,
        startDate,
        rec.randomEveryXDays
      )
    }
    return candidate
  }

  const lastGeneratedDateUTC = new Date(rec.lastGeneratedDate)
  let candidate = stepNextDate(
    lastGeneratedDateUTC,
    rec.frequency,
    startDate,
    rec.randomEveryXDays
  )

  while (candidate < todayUTC && !isSameUTCDate(candidate, todayUTC)) {
    candidate = stepNextDate(
      candidate,
      rec.frequency,
      startDate,
      rec.randomEveryXDays
    )
  }

  return candidate
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

  if (
    rec.lastGeneratedDate &&
    isSameUTCDate(new Date(rec.lastGeneratedDate), todayUTC)
  ) {
    return false
  }

  const nextDate = getNextDate(rec, todayUTC)

  return isSameUTCDate(nextDate, todayUTC)
}

export function getDueDates(
  rec: DBRecurringTransaction,
  todayUTC: Date
): Date[] {
  const startUTC = normalizeToUTCMidnight(new Date(rec.startDate))
  const endUTC = rec.endDate
    ? normalizeToUTCMidnight(new Date(rec.endDate))
    : null

  if (todayUTC < startUTC) {
    return []
  }

  // If lastGeneratedDate is already today, or already reached endDate, nothing to generate
  if (rec.lastGeneratedDate) {
    const lastGen = normalizeToUTCMidnight(new Date(rec.lastGeneratedDate))
    if (isSameUTCDate(lastGen, todayUTC) || (endUTC && lastGen >= endUTC)) {
      return []
    }
  }

  // Backfill all missed occurrences up to todayUTC
  const effectiveEndUTC = endUTC && endUTC < todayUTC ? endUTC : todayUTC
  const dueDates: Date[] = []

  let candidate = rec.lastGeneratedDate
    ? stepNextDate(
        normalizeToUTCMidnight(new Date(rec.lastGeneratedDate)),
        rec.frequency,
        startUTC,
        rec.randomEveryXDays
      )
    : startUTC

  const MAX_OCCURRENCES = 366
  while (
    candidate.getTime() <= effectiveEndUTC.getTime() &&
    dueDates.length < MAX_OCCURRENCES
  ) {
    if (candidate.getTime() >= startUTC.getTime()) {
      dueDates.push(candidate)
    }

    const next = stepNextDate(
      candidate,
      rec.frequency,
      startUTC,
      rec.randomEveryXDays
    )
    if (next.getTime() <= candidate.getTime()) {
      break
    }
    candidate = next
  }

  return dueDates
}
