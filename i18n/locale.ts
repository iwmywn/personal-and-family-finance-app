"use server"

import { cache } from "react"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"

import { DEFAULT_LOCALE, type AppLocale } from "@/i18n/config"
import { getUsersCollection } from "@/lib/collections"
import { session } from "@/lib/session"

const COOKIE_NAME = "locale"

export const getUserLocale = cache(async (): Promise<AppLocale> => {
  const [usersCollection, { userId }] = await Promise.all([
    getUsersCollection(),
    session.user.get(),
  ])

  const result = await usersCollection.findOne({ _id: new ObjectId(userId) })
  if (result?.locale) return result.locale

  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value
  if (cookieLocale) return cookieLocale as AppLocale

  return DEFAULT_LOCALE
})

const fourHundredDays = 400 * 24 * 60 * 60

export async function setUserLocale(locale: AppLocale) {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: fourHundredDays,
  })
}
