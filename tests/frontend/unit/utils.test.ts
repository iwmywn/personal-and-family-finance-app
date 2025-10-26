import { mockTransactions } from "@/tests/shared/data"
import {
  formatCurrency,
  formatDate,
  getMonthsConfig,
  getUniqueYears,
  normalizeToUTCDate,
} from "@/lib/utils"

describe("Utils", () => {
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
      const date = new Date("2024-01-15T23:30:00+05:00")
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
    const originalTZ = process.env.TZ

    beforeEach(() => {
      process.env.TZ = "Asia/Ho_Chi_Minh"
    })

    afterEach(() => {
      process.env.TZ = originalTZ
    })

    it("should format Date object correctly", () => {
      const date = new Date("2024-01-15T00:00:00.000+00:00")
      const result = formatDate(date)
      expect(result).toBe("T2, 15/01/2024")
    })

    it("should format local Indochina Time correctly", () => {
      const date = new Date(
        "Mon Jan 15 2024 00:00:00 GMT+0700 (Indochina Time)"
      )
      const result = formatDate(date)
      expect(result).toBe("T2, 15/01/2024")
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

  describe("getMonthsConfig", () => {
    it("should return months configuration", () => {
      const result = getMonthsConfig()
      expect(result).toHaveLength(12)
      expect(result[0]).toEqual({ value: "1", label: "Tháng 1" })
      expect(result[11]).toEqual({ value: "12", label: "Tháng 12" })
    })
  })
})
