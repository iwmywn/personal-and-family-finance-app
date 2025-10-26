import { mockTransactions } from "@/tests/shared/data"
import { getMonthsConfig, getUniqueYears } from "@/lib/helpers/transactions"

describe("Transaction Helpers", () => {
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
