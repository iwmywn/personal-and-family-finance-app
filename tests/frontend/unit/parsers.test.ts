import { parseAsLocalDate, parseToUTCMidnight } from "@/lib/parsers"

describe("Parsers", () => {
  describe("parseAsLocalDate", () => {
    it("should correctly parse valid YYYY-MM-DD date strings", () => {
      const parsed = parseAsLocalDate.parse("2026-08-24")
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2026)
      expect(parsed?.getMonth()).toBe(7) // August is 7
      expect(parsed?.getDate()).toBe(24)
    })

    it("should correctly parse ISO date strings containing T", () => {
      const parsed = parseAsLocalDate.parse("2026-08-24T15:30:00.000Z")
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2026)
      expect(parsed?.getMonth()).toBe(7)
      expect(parsed?.getDate()).toBe(24)
    })

    it("should return null for invalid date formats", () => {
      expect(parseAsLocalDate.parse("invalid")).toBeNull()
      expect(parseAsLocalDate.parse("2026-8-24")).toBeNull()
      expect(parseAsLocalDate.parse("24-08-2026")).toBeNull()
      expect(parseAsLocalDate.parse("")).toBeNull()
    })

    it("should return null for non-existent calendar dates (e.g. Feb 30)", () => {
      expect(parseAsLocalDate.parse("2026-02-30")).toBeNull()
      expect(parseAsLocalDate.parse("2026-04-31")).toBeNull()
      expect(parseAsLocalDate.parse("2026-13-01")).toBeNull()
    })

    it("should serialize a local Date into YYYY-MM-DD format", () => {
      const date = new Date(2026, 7, 24) // Aug 24, 2026
      const serialized = parseAsLocalDate.serialize(date)
      expect(serialized).toBe("2026-08-24")
    })

    it("should correctly check equality between two Date instances", () => {
      const date1 = new Date(2026, 7, 24, 0, 0, 0)
      const date2 = new Date(2026, 7, 24, 15, 30, 0)
      const date3 = new Date(2026, 7, 25, 0, 0, 0)

      expect(parseAsLocalDate.eq(date1, date2)).toBe(true)
      expect(parseAsLocalDate.eq(date1, date3)).toBe(false)
    })
  })

  describe("parseToUTCMidnight", () => {
    it("should correctly parse YYYY-MM-DD string to UTC midnight", () => {
      const result = parseToUTCMidnight("2026-09-10")
      expect(result).not.toBeNull()
      expect(result?.toISOString()).toBe("2026-09-10T00:00:00.000Z")
    })

    it("should parse ISO string with time to UTC midnight on that calendar day", () => {
      const result = parseToUTCMidnight("2026-09-10T14:30:00.000Z")
      expect(result).not.toBeNull()
      expect(result?.toISOString()).toBe("2026-09-10T00:00:00.000Z")
    })

    it("should preserve already UTC midnight Date instance", () => {
      const utcDate = new Date("2026-09-10T00:00:00.000Z")
      const result = parseToUTCMidnight(utcDate)
      expect(result).not.toBeNull()
      expect(result?.toISOString()).toBe("2026-09-10T00:00:00.000Z")
    })

    it("should convert a local Date instance to UTC midnight of local calendar date", () => {
      const localDate = new Date(2026, 8, 10, 15, 30, 0)
      const result = parseToUTCMidnight(localDate)
      expect(result).not.toBeNull()
      expect(result?.getUTCFullYear()).toBe(2026)
      expect(result?.getUTCMonth()).toBe(8)
      expect(result?.getUTCDate()).toBe(10)
      expect(result?.getUTCHours()).toBe(0)
      expect(result?.getUTCMinutes()).toBe(0)
    })

    it("should return null for invalid date strings", () => {
      expect(parseToUTCMidnight("invalid")).toBeNull()
      expect(parseToUTCMidnight("2026-02-30")).toBeNull()
      expect(parseToUTCMidnight("2026-04-31")).toBeNull()
      expect(parseToUTCMidnight("")).toBeNull()
      expect(parseToUTCMidnight(null)).toBeNull()
      expect(parseToUTCMidnight(undefined)).toBeNull()
      expect(parseToUTCMidnight(new Date("invalid"))).toBeNull()
    })
  })
})
