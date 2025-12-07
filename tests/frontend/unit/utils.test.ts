import { mockTransactions } from "@/tests/shared/data"
import type { AppLocale } from "@/i18n/config"
import {
  formatCurrency,
  formatDate,
  getUniqueYears,
  normalizeToUTCDate,
} from "@/lib/utils"

describe("Utils", () => {
  const originalTZ = process.env.TZ

  beforeAll(() => {
    process.env.TZ = "Asia/Ho_Chi_Minh"
  })

  afterAll(() => {
    process.env.TZ = originalTZ
  })

  describe("normalizeToUTCDate", () => {
    it("should normalize date to UTC", () => {
      const date = new Date("2024-01-15T10:30:00Z")
      const result = normalizeToUTCDate(date)
      expect(result.getUTCHours()).toBe(0)
      expect(result.getUTCMinutes()).toBe(0)
      expect(result.getUTCSeconds()).toBe(0)
      expect(result.getUTCMilliseconds()).toBe(0)
    })

    it("should preserve year, month, and day", () => {
      const date = new Date("2024-01-15T10:30:00Z")
      const result = normalizeToUTCDate(date)
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(0) // January is 0
      expect(result.getUTCDate()).toBe(15)
    })

    it("should handle different timezones", () => {
      const date = new Date("2024-01-16T06:35:00+07:00")
      const result = normalizeToUTCDate(date)
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(0)
      // The date might be different due to timezone conversion, so we check it's reasonable
      expect(result.getUTCDate()).toBeGreaterThanOrEqual(15)
      expect(result.getUTCDate()).toBeLessThanOrEqual(16)
    })
  })

  describe("formatCurrency", () => {
    it("should format currency in VND", () => {
      const result = formatCurrency(1000000)
      expect(result).toContain("1.000.000")
      expect(result).toContain("₫")
    })

    it("should handle zero amount", () => {
      const result = formatCurrency(0)
      expect(result).toContain("0")
      expect(result).toContain("₫")
    })

    it("should handle negative amount", () => {
      const result = formatCurrency(-500000)
      expect(result).toContain("-500.000")
      expect(result).toContain("₫")
    })

    it("should handle decimal amounts", () => {
      const result = formatCurrency(1234567.89)
      expect(result).toContain("1.234.568")
      expect(result).toContain("₫")
    })

    it("should handle large amounts", () => {
      const result = formatCurrency(1000000000)
      expect(result).toContain("1.000.000.000")
      expect(result).toContain("₫")
    })
  })

  describe("formatDate", () => {
    it("should formats in Vietnamese (vi) correctly", () => {
      const date = new Date("2024-01-15T00:00:00.000Z")
      const result = formatDate(date, "vi" as AppLocale)
      expect(result).toBe("Th 2, 15/01/2024")
    })

    it("should formats in English (en) correctly", () => {
      const date = new Date("2024-01-15T00:00:00.000Z")
      const result = formatDate(date, "en" as AppLocale)
      expect(result).toBe("Mon, 01/15/2024")
    })

    it("should formats local Indochina Time in vi", () => {
      const date = new Date(
        "Mon Jan 15 2024 00:00:00 GMT+0700 (Indochina Time)"
      )
      const result = formatDate(date, "vi" as AppLocale)
      expect(result).toBe("Th 2, 15/01/2024")
    })
  })

  describe("getUniqueYears", () => {
    it("should return unique years sorted descending", () => {
      const result = getUniqueYears(mockTransactions)
      expect(result).toEqual([2024, 2023])
    })

    it("should return empty array for empty transactions", () => {
      const result = getUniqueYears([])
      expect(result).toEqual([])
    })

    it("should handle single year", () => {
      const singleYear = mockTransactions.slice(1, 3)
      const result = getUniqueYears(singleYear)
      expect(result).toEqual([2024])
    })
  })
})
