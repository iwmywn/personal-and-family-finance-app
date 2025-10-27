"use server"

import { passwordSchema, type PasswordFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUserCollection } from "@/lib/collections"
import { session } from "@/lib/session"

export async function updatePassword(values: PasswordFormValues) {
  try {
    const tAuth = await getTranslations("auth")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tAuth("accessDenied"),
      }
    }

    const parsedValues = passwordSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: tAuth("invalidData") }
    }

    const { currentPassword, newPassword } = parsedValues.data

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!existingUser) {
      return { error: tAuth("userNotFound") }
    }

    let hashedPassword: string

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      )

      if (!isPasswordValid) {
        return { error: tAuth("passwordIncorrect") }
      }

      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else {
      hashedPassword = existingUser.password
    }

    const isSame = hashedPassword === existingUser.password

    if (isSame) {
      return { success: tAuth("noChanges") }
    }

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    )

    return { success: tAuth("passwordUpdated") }
  } catch (error) {
    console.error("Error updating password:", error)
    const tAuth = await getTranslations("auth")
    return { error: tAuth("passwordUpdateFailed") }
  }
}
