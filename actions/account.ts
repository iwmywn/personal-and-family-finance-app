"use server"

import { passwordSchema, type PasswordFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUserCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updatePassword(values: PasswordFormValues) {
  try {
    const tSettingsBE = await getTranslations("settings.be")
    const tCommonBE = await getTranslations("common.be")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const parsedValues = passwordSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tCommonBE("invalidData") }
    }

    const { currentPassword, newPassword } = parsedValues.data

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: tCommonBE("userNotFound") }
    }

    let hashedPassword: string

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      )

      if (!isPasswordValid) {
        return { error: tSettingsBE("passwordIncorrect") }
      }

      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else {
      hashedPassword = existingUser.password
    }

    const isSame = hashedPassword === existingUser.password

    if (isSame) {
      return { success: tSettingsBE("noChanges") }
    }

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    )

    return { success: tSettingsBE("passwordUpdated") }
  } catch (error) {
    console.error("Error updating password:", error)
    const tSettingsBE = await getTranslations("settings.be")
    return { error: tSettingsBE("passwordUpdateFailed") }
  }
}
