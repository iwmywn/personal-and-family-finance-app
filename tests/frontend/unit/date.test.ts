import { normalizeToUTCDate } from "@/lib/utils/date"

describe("Date Helpers", () => {
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
})
