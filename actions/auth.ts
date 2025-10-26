"use server"

import { signInSchema, type SignInFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUserCollection } from "@/lib/collections"
import { User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { session } from "@/lib/session"

export async function signIn(
  values: SignInFormValues,
  recaptchaToken: string | null
) {
  try {
    const t = await getTranslations("auth")

    if (!recaptchaToken) return { error: t("recaptchaMissing") }

    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: t("invalidData") }

    const { username, password } = parsedValues.data
    const [verify, userCollection] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUserCollection(),
    ])
    const existingUser = await userCollection.findOne({ username })

    if (!verify) return { error: t("recaptchaFailed") }
    if (!existingUser) return { error: t("signInError") }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) return { error: t("signInError") }

    await session.user.create(existingUser._id.toString(), existingUser.locale)

    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    const t = await getTranslations("auth")
    return { error: t("signInFailed") }
  }
}

export async function signOut() {
  try {
    await session.user.delete()
    const t = await getTranslations("auth")
    return { success: t("signOutSuccess"), error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    const t = await getTranslations("auth")
    return { error: t("signOutFailed") }
  }
}

export async function getUser() {
  try {
    const t = await getTranslations("auth")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: t("accessDenied"),
      }
    }

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    if (!existingUser) return { error: t("userNotFound") }

    const user = { ...existingUser, _id: existingUser._id.toString() } as Omit<
      User,
      "password"
    >

    return { user }
  } catch (error) {
    console.error("Error fetching user: ", error)
    const t = await getTranslations("auth")
    return {
      error: t("userFetchFailed"),
    }
  }
}
