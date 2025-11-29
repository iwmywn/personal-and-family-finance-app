"use server"

import { cache } from "react"
import { cookies, headers } from "next/headers"

import { DEFAULT_LOCALE, type AppLocale } from "@/i18n/config"
import { auth } from "@/lib/auth"

const COOKIE_NAME = "locale"

export const getUserLocale = cache(async (): Promise<AppLocale> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (session?.user.locale) return session.user.locale as AppLocale

  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value
  if (cookieLocale) return cookieLocale as AppLocale

  return DEFAULT_LOCALE
})

const fourHundredDays = 400 * 24 * 60 * 60

export async function setUserLocale(locale: AppLocale) {
  const store = await cookies()
  if (store.get(COOKIE_NAME)?.value === locale) return

  store.set(COOKIE_NAME, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: fourHundredDays,
  })
}
