"use server"

import { updateTag } from "next/cache"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { LOCALES, type AppLocale } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { getUsersCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updateLocale(locale: AppLocale) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    if (!LOCALES.includes(locale)) {
      return { error: t("settings.be.languageUpdateFailed") }
    }

    const usersCollection = await getUsersCollection()
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: t("common.be.userNotFound") }
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          locale: locale,
        },
      }
    )

    await setUserLocale(locale)

    updateTag("user")
    return { success: t("settings.be.languageUpdated") }
  } catch (error) {
    console.error("Error updating locale:", error)
    return { error: t("settings.be.languageUpdateFailed") }
  }
}
