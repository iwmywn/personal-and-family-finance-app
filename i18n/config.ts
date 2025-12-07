import { enUS, vi, type DayPickerLocale } from "react-day-picker/locale"

export type AppLocale = (typeof _LOCALES)[number]

const _LOCALES = ["vi", "en"] as const
export const DEFAULT_LOCALE: AppLocale = "vi"

type LocaleConfigType = {
  [K in AppLocale]: {
    dateLocale: DayPickerLocale
    intlLocale: string
    displayName: string
  }
}

export const LOCALE_CONFIG: LocaleConfigType = {
  vi: {
    dateLocale: vi,
    intlLocale: "vi-VN",
    displayName: "Tiếng Việt",
  },
  en: {
    dateLocale: enUS,
    intlLocale: "en-US",
    displayName: "English",
  },
}
