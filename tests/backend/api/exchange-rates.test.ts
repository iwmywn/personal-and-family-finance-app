import { NextRequest } from "next/server"

import { insertTestExchangeRate } from "@/tests/backend/helpers/database"
import { mockExchangeRates } from "@/tests/shared/data"
import { getExchangeRatesCollection } from "@/lib/collections"
import { normalizeToUTCMidnight } from "@/lib/utils"
import { GET } from "@/app/api/(cronjobs)/exchange-rates/route"

const cronSecret = "test-cron-secret"
const cronEndpoint = "http://localhost/api/exchange-rates"

const mockCurrencyAPIResponse = [
  {
    meta: {
      last_updated_at: "2024-12-22T23:59:59Z",
    },
    data: {
      CNY: {
        code: "CNY",
        value: 7.0366009237,
      },
      JPY: {
        code: "JPY",
        value: 156.8850221257,
      },
      KRW: {
        code: "KRW",
        value: 1480.216265847,
      },
      VND: {
        code: "VND",
        value: 26310.003541037,
      },
    },
  },
  {
    meta: {
      last_updated_at: "2024-12-23T23:59:59Z",
    },
    data: {
      CNY: {
        code: "CNY",
        value: 7.0280007505,
      },
      JPY: {
        code: "JPY",
        value: 156.1690311899,
      },
      KRW: {
        code: "KRW",
        value: 1480.9201782294,
      },
      VND: {
        code: "VND",
        value: 26330.00392171,
      },
    },
  },
]

describe("Exchange Rates Cron Job", () => {
  describe("Authorization", () => {
    it("should return 401 when authorization header is missing", async () => {
      const request = new NextRequest(cronEndpoint)

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(401)
      expect(text).toBe("Unauthorized")
    })

    it("should return 401 when authorization header is invalid", async () => {
      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: "Bearer wrong-secret",
        },
      })

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(401)
      expect(text).toBe("Unauthorized")
    })

    it("should return 401 when authorization header format is wrong", async () => {
      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Invalid ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const text = await response.text()

      expect(response.status).toBe(401)
      expect(text).toBe("Unauthorized")
    })
  })

  describe("Successful execution", () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    it("should fetch and save exchange rates when last rate exists and needs update", async () => {
      const twoDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-22T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: twoDaysAgo,
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockCurrencyAPIResponse[1],
      } as Response)

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inserted).toBe(1)
      expect(data.insertedDates).toHaveLength(1)
      expect(data.insertedDates[0]).toBe("2024-12-23")

      const exchangeRatesCollection = await getExchangeRatesCollection()
      const savedRate = await exchangeRatesCollection.findOne({
        date: normalizeToUTCMidnight(new Date("2024-12-23T23:59:59Z")),
      })

      expect(savedRate).toBeDefined()
      expect(savedRate?.rates.CNY.toString()).toBe("7.0280007505")
      expect(savedRate?.rates.JPY.toString()).toBe("156.1690311899")
      expect(savedRate?.rates.KRW.toString()).toBe("1480.9201782294")
      expect(savedRate?.rates.VND.toString()).toBe("26330.00392171")

      vi.useRealTimers()
    })

    it("should fetch multiple days when there are gaps", async () => {
      const threeDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-21T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: threeDaysAgo,
      })

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrencyAPIResponse[0],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrencyAPIResponse[1],
        } as Response)

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inserted).toBe(2)
      expect(data.insertedDates).toHaveLength(2)
      expect(data.insertedDates).toContain("2024-12-22")
      expect(data.insertedDates).toContain("2024-12-23")

      const exchangeRatesCollection = await getExchangeRatesCollection()
      const allRates = await exchangeRatesCollection
        .find({
          date: { $gte: threeDaysAgo },
        })
        .sort({ date: 1 })
        .toArray()

      expect(allRates).toHaveLength(3) // original + 2 new

      vi.useRealTimers()
    })

    it("should return 'No new rates to fetch' when already up to date", async () => {
      const yesterday = normalizeToUTCMidnight(new Date("2024-12-23T23:59:59Z"))

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: yesterday,
      })

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe("No new rates to fetch.")
      expect(data.lastDate).toBeDefined()

      vi.useRealTimers()
    })

    it("should handle API errors gracefully", async () => {
      const twoDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-22T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: twoDaysAgo,
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 429,
      } as Response)

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inserted).toBe(0)
      expect(data.errors).toBeDefined()
      expect(data.errors).toHaveLength(1)
      expect(data.errors[0].error).toContain("API returned 429")

      vi.useRealTimers()
    })

    it("should handle network errors gracefully", async () => {
      const twoDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-22T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: twoDaysAgo,
      })

      vi.mocked(global.fetch).mockRejectedValue(
        new Error("Network request failed")
      )

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inserted).toBe(0)
      expect(data.errors).toBeDefined()
      expect(data.errors).toHaveLength(1)
      expect(data.errors[0].error).toBe("Network request failed")

      vi.useRealTimers()
    })

    it("should handle partial success (some days succeed, some fail)", async () => {
      const threeDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-21T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: threeDaysAgo,
      })

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCurrencyAPIResponse[0],
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inserted).toBe(1)
      expect(data.insertedDates).toContain("2024-12-22")
      expect(data.errors).toBeDefined()
      expect(data.errors).toHaveLength(1)
      expect(data.errors[0].date).toBe("2024-12-23")

      vi.useRealTimers()
    })
  })

  describe("Edge cases", () => {
    beforeEach(() => {
      global.fetch = vi.fn()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it("should handle empty collection (no existing rates)", async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe(
        "No existing exchange rates found. Please initialize manually."
      )

      vi.useRealTimers()
    })

    it("should verify API URL is constructed correctly", async () => {
      const twoDaysAgo = normalizeToUTCMidnight(
        new Date("2024-12-22T23:59:59Z")
      )

      await insertTestExchangeRate({
        ...mockExchangeRates[0],
        date: twoDaysAgo,
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockCurrencyAPIResponse,
      } as Response)

      vi.useFakeTimers()
      vi.setSystemTime(new Date("2024-12-24T12:00:00.000Z"))

      const request = new NextRequest(cronEndpoint, {
        headers: {
          authorization: `Bearer ${cronSecret}`,
        },
      })

      await GET(request)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://api.currencyapi.com/v3/historical")
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("currencies=CNY%2CVND%2CJPY%2CKRW")
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("date=2024-12-23")
      )

      vi.useRealTimers()
    })
  })
})
