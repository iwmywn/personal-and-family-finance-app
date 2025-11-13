"use server"

import { cacheTag, updateTag } from "next/cache"
import { createSignInSchema, type SignInFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { setUserLocale } from "@/i18n/locale"
import type { TypedTranslationFunction } from "@/i18n/types"
import { getUsersCollection } from "@/lib/collections"
import { type User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { session } from "@/lib/session"

export async function signIn(
  values: SignInFormValues,
  recaptchaToken: string | null
) {
  const t = await getTranslations()

  try {
    if (!recaptchaToken) return { error: t("auth.be.recaptchaMissing") }

    const signInSchema = createSignInSchema(t)
    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: t("common.be.invalidData") }

    const { username, password } = parsedValues.data
    const [verify, usersCollection] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUsersCollection(),
    ])
    const existingUser = await usersCollection.findOne({ username })

    if (!verify) return { error: t("auth.be.recaptchaFailed") }
    if (!existingUser) return { error: t("auth.be.signInError") }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) return { error: t("auth.be.signInError") }

    await Promise.all([
      session.user.create(existingUser._id.toString()),
      setUserLocale(existingUser.locale),
    ])

    updateTag("user")
    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    return { error: t("auth.be.signInFailed") }
  }
}

export async function signOut() {
  const t = await getTranslations()

  try {
    await session.user.delete()

    return { success: t("auth.be.signOutSuccess"), error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    return { error: t("auth.be.signOutFailed") }
  }
}

export async function getUser(userId: string, t: TypedTranslationFunction) {
  "use cache"
  cacheTag("user")
  try {
    if (!userId) {
      return {
        error: t("common.be.accessDenied"),
      }
    }

    const userCollection = await getUsersCollection()

    const existingUser = await userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    if (!existingUser) return { error: t("common.be.userNotFound") }

    const user = { ...existingUser, _id: existingUser._id.toString() } as Omit<
      User,
      "password"
    >

    return { user }
  } catch (error) {
    console.error("Error fetching user: ", error)
    return {
      error: t("auth.be.userFetchFailed"),
    }
  }
}
