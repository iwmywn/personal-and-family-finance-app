"use server"

import { updateTag } from "next/cache"
import { LOCALES, type AppLocale } from "@/i18n/config"
import { setUserLocale } from "@/i18n/locale"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUsersCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updateLocale(locale: AppLocale) {
  try {
    const [tCommonBE, tSettingsBE] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("settings.be"),
    ])
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    if (!LOCALES.includes(locale)) {
      return { error: tSettingsBE("languageUpdateFailed") }
    }

    const usersCollection = await getUsersCollection()
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: tCommonBE("userNotFound") }
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
    return { success: tSettingsBE("languageUpdated") }
  } catch (error) {
    console.error("Error updating locale:", error)
    const tSettingsBE = await getTranslations("settings.be")
    return { error: tSettingsBE("languageUpdateFailed") }
  }
}
