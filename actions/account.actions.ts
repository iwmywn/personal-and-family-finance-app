"use server"

import { createPasswordSchema, type PasswordFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUsersCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updatePassword(values: PasswordFormValues) {
  const t = await getTranslations()

  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const passwordSchema = createPasswordSchema(t)
    const parsedValues = passwordSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: t("common.be.invalidData") }
    }

    const { currentPassword, newPassword } = parsedValues.data

    const usersCollection = await getUsersCollection()
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: t("common.be.userNotFound") }
    }

    let hashedPassword: string

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      )

      if (!isPasswordValid) {
        return { error: t("settings.be.passwordIncorrect") }
      }

      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else {
      hashedPassword = existingUser.password
    }

    const isSame = hashedPassword === existingUser.password

    if (isSame) {
      return { success: t("settings.be.noChanges") }
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    )

    return { success: t("settings.be.passwordUpdated") }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: t("settings.be.passwordUpdateFailed") }
  }
}
