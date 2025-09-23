"use server"

import { passwordSchema } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

import { SettingsFormValues } from "@/components/settings/account-form"
import { getUserCollection } from "@/lib/collections"
import { getUserById } from "@/lib/data"
import { session } from "@/lib/session"

export async function updatePassword(values: SettingsFormValues) {
  try {
    const { userId } = await session.user.get()

    if (!userId) {
      return { error: "Unauthorized! Please reload the page and try again." }
    }

    const parsedValues = passwordSchema.safeParse(values)

    if (!parsedValues.success) {
      return { error: "Invalid data provided!" }
    }

    const { currentPassword, newPassword } = parsedValues.data

    const existingUser = await getUserById(userId)
    if (!existingUser) {
      return { error: "User not found!" }
    }

    let hashedPassword: string

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password
      )

      if (!isPasswordValid) {
        return { error: "Current password is incorrect!" }
      }

      hashedPassword = await bcrypt.hash(newPassword, 10)
    } else {
      hashedPassword = existingUser.password
    }

    const isSame = hashedPassword === existingUser.password

    if (isSame) {
      return { success: "No changes were made." }
    }

    const userCollection = await getUserCollection()

    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
        },
      }
    )

    return { success: "Your password has been changed." }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: "Failed to update password! Please try again later." }
  }
}
