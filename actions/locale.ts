"use server"

import { Locale, locales } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUserCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updateLocale(locale: Locale) {
  try {
    const t = await getTranslations("settings")

    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    if (!locales.includes(locale)) {
      return { error: t("languageUpdateFailed") }
    }

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: t("userNotFound") }
    }

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          locale: locale,
        },
      }
    )

    const s = await session.user.get()
    s.locale = locale

    await Promise.all([s.save(), setUserLocale(locale)])

    return { success: t("languageUpdated") }
  } catch (error) {
    console.error("Error updating locale:", error)
    const t = await getTranslations("settings")
    return { error: t("languageUpdateFailed") }
  }
}
