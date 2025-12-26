import {
  enUS,
  ja,
  ko,
  vi,
  zhCN,
  type DayPickerLocale,
} from "react-day-picker/locale"

export const LOCALES = ["en-US", "zh-CN", "ja-JP", "ko-KR", "vi-VN"] as const

export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = "vi-VN"

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
