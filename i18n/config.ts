import { enUS, vi } from "date-fns/locale"
import type { Locale as DateFnsLocale } from "date-fns/locale"

export type AppLocale = (typeof _LOCALES)[number]

const _LOCALES = ["vi", "en"] as const
export const DEFAULT_LOCALE: AppLocale = "vi"

type LocaleConfigType = {
  [K in AppLocale]: {
    dateFnsLocale: DateFnsLocale
    intlLocale: string
    displayName: string
    formatStr: string
  }
}

export const LOCALE_CONFIG: LocaleConfigType = {
  vi: {
    dateFnsLocale: vi,
    intlLocale: "vi-VN",
    displayName: "Tiếng Việt",
    formatStr: "EEEEEE, dd/MM/yyyy",
  },
  en: {
    dateFnsLocale: enUS,
    intlLocale: "en-US",
    displayName: "English",
    formatStr: "EEEEEE, MM/dd/yyyy",
  },
}
