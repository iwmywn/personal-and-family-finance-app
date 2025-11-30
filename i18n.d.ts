import { type AppLocale } from "@/i18n/config"

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale
  }
}
