"use server"

import { setUserLocale } from "@/i18n/locale"
import { createSignInSchema, type SignInFormValues } from "@/schemas"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import { getUsersCollection } from "@/lib/collections"
import { type User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"
import { session } from "@/lib/session"

export async function signIn(
  values: SignInFormValues,
  recaptchaToken: string | null
) {
  try {
    const [tCommonBE, tAuthBE, tSchemasSignIn] = await Promise.all([
      getTranslations("common.be"),
      getTranslations("auth.be"),
      getTranslations("schemas.signIn"),
    ])

    if (!recaptchaToken) return { error: tAuthBE("recaptchaMissing") }

    const signInSchema = createSignInSchema(tSchemasSignIn)
    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: tCommonBE("invalidData") }

    const { username, password } = parsedValues.data
    const [verify, usersCollection] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUsersCollection(),
    ])
    const existingUser = await usersCollection.findOne({ username })

    if (!verify) return { error: tAuthBE("recaptchaFailed") }
    if (!existingUser) return { error: tAuthBE("signInError") }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) return { error: tAuthBE("signInError") }

    await Promise.all([
      session.user.create(existingUser._id.toString()),
      setUserLocale(existingUser.locale),
    ])

    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    const tAuthBE = await getTranslations("auth.be")
    return { error: tAuthBE("signInFailed") }
  }
}

export async function signOut() {
  try {
    const tAuthBE = await getTranslations("auth.be")
    await session.user.delete()

    return { success: tAuthBE("signOutSuccess"), error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    const tAuthBE = await getTranslations("auth.be")
    return { error: tAuthBE("signOutFailed") }
  }
}

export async function getUser() {
  try {
    const tCommonBE = await getTranslations("common.be")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tCommonBE("accessDenied"),
      }
    }

    const userCollection = await getUsersCollection()

    const existingUser = await userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    if (!existingUser) return { error: tCommonBE("userNotFound") }

    const user = { ...existingUser, _id: existingUser._id.toString() } as Omit<
      User,
      "password"
    >

    return { user }
  } catch (error) {
    console.error("Error fetching user: ", error)
    const tAuthBE = await getTranslations("auth.be")
    return {
      error: tAuthBE("userFetchFailed"),
    }
  }
}
