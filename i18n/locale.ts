"use server"

import { cookies } from "next/headers"
import { AppLocale, DEFAULT_LOCALE } from "@/i18n/config"
import { ObjectId } from "mongodb"

import { getUsersCollection } from "@/lib/collections"
import { session } from "@/lib/session"

const COOKIE_NAME = "locale"

export async function getUserLocale() {
  const locale: AppLocale = DEFAULT_LOCALE

  const [usersCollection, { userId }] = await Promise.all([
    getUsersCollection(),
    session.user.get(),
  ])

  const result = await usersCollection.findOne({ _id: new ObjectId(userId) })
  if (result?.locale) return result.locale as AppLocale

  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value
  if (cookieLocale) return cookieLocale as AppLocale

  return locale
}

const fourHundredDays = 400 * 24 * 60 * 60

export async function setUserLocale(locale: AppLocale) {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: fourHundredDays,
  })
}
