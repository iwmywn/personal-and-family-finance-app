import { enUS, vi, zhCN, type DayPickerLocale } from "react-day-picker/locale"

export type AppLocale = (typeof _LOCALES)[number]

const _LOCALES = ["vi-VN", "en-US", "zh-CN"] as const
export const DEFAULT_LOCALE: AppLocale = "vi-VN"

type LocaleConfigType = {
  [K in AppLocale]: {
    dateLocale: DayPickerLocale
    displayName: string
  }
}

export const LOCALE_CONFIG: LocaleConfigType = {
  "vi-VN": {
    dateLocale: vi,
    displayName: "Tiếng Việt",
  },
  "en-US": {
    dateLocale: enUS,
    displayName: "English",
  },
  "zh-CN": {
    dateLocale: zhCN,
    displayName: "简体中文",
  },
}
