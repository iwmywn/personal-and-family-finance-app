"use server"

import { cookies } from "next/headers"
import { AppLocale, DEFAULT_LOCALE } from "@/i18n/config"

import { session } from "@/lib/session"

const COOKIE_NAME = "locale"

export async function getUserLocale() {
  const locale: AppLocale = DEFAULT_LOCALE

  const user = await session.user.get()
  if (user?.locale) return user.locale as AppLocale

  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value
  if (cookieLocale) return cookieLocale as AppLocale

  return locale
}

export async function setUserLocale(locale: AppLocale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
