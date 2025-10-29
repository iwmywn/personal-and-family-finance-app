import { enUS, vi } from "date-fns/locale"
import type { Locale as DateFnsLocale } from "date-fns/locale"

export type AppLocale = (typeof LOCALES)[number]

export const LOCALES = ["vi", "en"] as const
export const DEFAULT_LOCALE: AppLocale = "vi"

type LocaleConfigType = {
  [K in AppLocale]: {
    dateFnsLocale: DateFnsLocale
    intlLocale: string
    displayName: string
  }
}

export const LOCALE_CONFIG: LocaleConfigType = {
  vi: {
    dateFnsLocale: vi,
    intlLocale: "vi-VN",
    displayName: "Tiếng Việt",
  },
  en: {
    dateFnsLocale: enUS,
    intlLocale: "en-US",
    displayName: "English",
  },
}
