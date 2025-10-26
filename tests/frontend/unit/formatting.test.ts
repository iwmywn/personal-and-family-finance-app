import { formatCurrency, formatDate } from "@/lib/utils/formatting"

describe("Formatting Helpers", () => {
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
    it("should format date string correctly", () => {
      const result = formatDate("2024-01-15")
      expect(result).toContain("15/01/2024")
      expect(result).toMatch(/T\d+,/)
    })

    it("should format Date object correctly", () => {
      const date = new Date("2024-01-15")
      const result = formatDate(date)
      expect(result).toContain("15/01/2024")
      expect(result).toMatch(/T\d+,/)
    })
  })
})
