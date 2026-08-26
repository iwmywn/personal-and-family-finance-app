import { parseAsLocalDate } from "@/lib/parsers"

describe("Parsers", () => {
  describe("parseAsLocalDate", () => {
    it("should correctly parse valid YYYY-MM-DD date strings", () => {
      const parsed = parseAsLocalDate.parse("2026-08-24")
      expect(parsed).not.toBeNull()
      expect(parsed?.getFullYear()).toBe(2026)
      expect(parsed?.getMonth()).toBe(7) // August is 7
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
      const date1 = new Date(2026, 7, 24)
      const date2 = new Date(2026, 7, 24)
      const date3 = new Date(2026, 7, 25)

      expect(parseAsLocalDate.eq(date1, date2)).toBe(true)
      expect(parseAsLocalDate.eq(date1, date3)).toBe(false)
    })
  })
})
