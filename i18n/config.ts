import { enUS, ja, ko, vi, zhCN } from "react-day-picker/locale"
import type { DayPickerLocale } from "react-day-picker/locale"

export const LOCALES = ["en-US", "zh-CN", "ja-JP", "ko-KR", "vi-VN"] as const

export type AppLocale = (typeof LOCALES)[number]

// Default UI locale displayed to the user (fallback locale)
export const DEFAULT_LOCALE: AppLocale = "vi-VN"

// Source (base) locale used as reference in source code and translation dictionaries
export const SOURCE_LOCALE: AppLocale = "en-US"

type LocaleConfigType = {
  [K in AppLocale]: {
    dateLocale: DayPickerLocale
    displayName: string
  }
}

export const LOCALE_CONFIG: LocaleConfigType = {
  "en-US": {
    dateLocale: enUS,
    displayName: "English",
  },
  "zh-CN": {
    dateLocale: zhCN,
    displayName: "简体中文",
  },
  "ja-JP": {
    dateLocale: ja,
    displayName: "日本語",
  },
  "ko-KR": {
    dateLocale: ko,
    displayName: "한국어",
  },
  "vi-VN": {
    dateLocale: vi,
    displayName: "Tiếng Việt",
  },
}
