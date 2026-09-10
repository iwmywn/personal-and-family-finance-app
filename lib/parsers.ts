import { createParser } from "nuqs/server"

import { localDateToUTCMidnight } from "@/lib/utils"

export function serializeLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const parseAsLocalDate = createParser({
  parse: (queryValue: string) => {
    const cleanValue = queryValue.includes("T")
      ? queryValue.split("T")[0]
      : queryValue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) return null
    const [year, month, day] = cleanValue.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null
    }
    return date
  },
  serialize: serializeLocalDate,
  eq: (a: Date, b: Date) => serializeLocalDate(a) === serializeLocalDate(b),
})

export function parseToUTCMidnight(val: unknown): Date | null {
  if (!val) return null

  if (typeof val === "string") {
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2])
      const day = Number(match[3])
      const utcDate = new Date(Date.UTC(year, month - 1, day))
      if (
        isNaN(utcDate.getTime()) ||
        utcDate.getUTCFullYear() !== year ||
        utcDate.getUTCMonth() !== month - 1 ||
        utcDate.getUTCDate() !== day
      ) {
        return null
      }
      return utcDate
    }

    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    )
  }

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null
    if (
      val.getUTCHours() === 0 &&
      val.getUTCMinutes() === 0 &&
      val.getUTCSeconds() === 0 &&
      val.getUTCMilliseconds() === 0
    ) {
      return val
    }
    return localDateToUTCMidnight(val)
  }

  return null
}
