import type { AppLocale } from "@/i18n/config"

export const CURRENCIES = ["USD", "CNY", "JPY", "KRW", "VND"] as const

export const ZERO_DECIMAL_CURRENCIES = new Set<AppCurrency>([
  "JPY",
  "KRW",
  "VND",
])

export type AppCurrency = (typeof CURRENCIES)[number]

export const DEFAULT_CURRENCY: AppCurrency = "VND"

type CurrencyConfigType = {
  [K in AppCurrency]: {
    displayName: string
    locale: AppLocale
  }
}

export const CURRENCY_CONFIG: CurrencyConfigType = {
  USD: {
    displayName: "US Dollar ($)",
    locale: "en-US",
  },
  CNY: {
    displayName: "人民币 (¥)",
    locale: "zh-CN",
  },
  JPY: {
    displayName: "日本円 (¥)",
    locale: "ja-JP",
  },
  KRW: {
    displayName: "대한민국 원 (₩)",
    locale: "ko-KR",
  },
  VND: {
    displayName: "Việt Nam đồng (₫)",
    locale: "vi-VN",
  },
}
