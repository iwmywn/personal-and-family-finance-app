import { Decimal128 } from "mongodb"

export function toDecimal128(value: string): Decimal128 {
  return Decimal128.fromString(value)
}

export function normalizeToUTCMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}
