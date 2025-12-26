import { insertTestExchangeRates } from "@/tests/backend/helpers/database"
import { mockExchangeRates, mockTransactions } from "@/tests/shared/data"
import { convertTransactionsToCurrency } from "@/actions/exchange-rates.actions"
import type { Transaction } from "@/lib/definitions"

describe("convertTransactionsToCurrency", () => {
  describe("Empty transactions", () => {
    it("should return empty array when given empty transactions array", async () => {
      const result = await convertTransactionsToCurrency([], "USD")
      expect(result).toEqual([])
    })
  })

  describe("No exchange rates available", () => {
    it("should return original transactions when no exchange rates are in database", async () => {
      const result = await convertTransactionsToCurrency(
        mockTransactions,
        "USD"
      )

      expect(result).toEqual(mockTransactions)
    })
  })

  describe("Currency conversion", () => {
    beforeEach(async () => {
      await insertTestExchangeRates(mockExchangeRates)
    })

    it("should convert VND to USD using the correct exchange rate", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[0],
          // 1000 VND
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "USD")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("USD")
      expect(result[0].amount).toBe("0.04")
    })

    it("should convert USD to VND using the correct exchange rate", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[1],
          // 200 USD
          currency: "USD",
          date: new Date("2024-01-15"),
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("VND")
      expect(result[0].amount).toBe("5000000")
    })

    it("should convert JPY to CNY through USD", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[2],
          // 500 JPY
          currency: "JPY",
          date: new Date("2024-01-25"),
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "CNY")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("CNY")
      expect(result[0].amount).toBe("23.509933774834437086")
    })

    it("should handle same currency conversion (no conversion needed)", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[5],
          // 500000 VND
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("VND")
      expect(result[0].amount).toBe("500000")
    })
  })

  describe("Multiple transactions with different dates", () => {
    beforeEach(async () => {
      await insertTestExchangeRates(mockExchangeRates)
    })

    it("should use correct exchange rates based on transaction dates", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[6],
          // 400000 VND
        },
        {
          ...mockTransactions[7],
          // 2100000 VND
          date: new Date("2024-01-25"),
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "USD")

      expect(result).toHaveLength(2)
      expect(result.every((tx) => tx.currency === "USD")).toBe(true)
      expect(result[0].amount).toBe("15.873015873015873016")
      expect(result[1].amount).toBe("83.665338645418326693")
    })

    it("should maintain original transaction order", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[0],
        },
        {
          ...mockTransactions[1],
        },
        {
          ...mockTransactions[2],
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(3)
      expect(result[0]._id).toBe("1")
      expect(result[1]._id).toBe("2")
      expect(result[2]._id).toBe("3")
    })
  })

  describe("Multiple currencies in single batch", () => {
    beforeEach(async () => {
      await insertTestExchangeRates(mockExchangeRates)
    })

    it("should convert transactions with different source currencies to same target", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[0],
          // 1000 VND
        },
        {
          ...mockTransactions[1],
          // 200 USD
          currency: "USD",
          date: new Date("2024-01-25"),
        },
        {
          ...mockTransactions[2],
          // 500 CNY
          currency: "CNY",
          date: new Date("2024-01-25"),
        },
        {
          ...mockTransactions[3],
          // 100 JPY
          currency: "JPY",
          date: new Date("2024-02-20"),
        },
        {
          ...mockTransactions[4],
          // 300 KRW
          currency: "KRW",
          date: new Date("2024-02-20"),
        },
      ]
      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(5)
      expect(result.every((tx) => tx.currency === "VND")).toBe(true)

      expect(result[0].amount).toBe("1000")
      expect(result[1].amount).toBe("5020000")
      expect(result[2].amount).toBe("1767605.6338028169014")
      expect(result[3].amount).toBe("16578.947368421052632")
      expect(result[4].amount).toBe("5727.2727272727272728")
    })
  })

  describe("Edge cases", () => {
    beforeEach(async () => {
      await insertTestExchangeRates(mockExchangeRates)
    })

    it("should handle decimal amounts", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[1],
          amount: "234.56",
          currency: "USD",
          date: new Date("2024-01-15"),
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("VND")
      expect(result[0].amount).toBe("5864000")
    })

    it("should handle very large amounts", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[0],
          amount: "1000000000",
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "USD")

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe("USD")
      expect(result[0].amount).toBe("40000")
    })

    it("should preserve all transaction properties except amount and currency", async () => {
      const transactions: Transaction[] = [
        {
          ...mockTransactions[1],
          currency: "USD",
          date: new Date("2024-01-15"),
        },
      ]

      const result = await convertTransactionsToCurrency(transactions, "VND")

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe("2")
      expect(result[0].userId).toBe("68f712e4cda4897217a05a1c")
      expect(result[0].type).toBe("expense")
      expect(result[0].categoryKey).toBe("food_beverage")
      expect(result[0].description).toBe("Groceries")
      expect(result[0].date).toEqual(transactions[0].date)
      expect(result[0].currency).toBe("VND")
      expect(result[0].amount).toBe("5000000")
    })
  })
})
