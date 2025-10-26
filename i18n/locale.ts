"use server"

import { cookies } from "next/headers"
import { defaultLocale, Locale } from "@/i18n/config"

import { session } from "@/lib/session"

const COOKIE_NAME = "locale"

export async function getUserLocale() {
  const locale: Locale = defaultLocale

  const user = await session.user.get()
  if (user?.locale) return user.locale as Locale

  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value
  if (cookieLocale) return cookieLocale as Locale

  return locale
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
