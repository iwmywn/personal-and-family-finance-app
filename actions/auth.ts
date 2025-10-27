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
    const tAuth = await getTranslations("auth")

    if (!recaptchaToken) return { error: tAuth("recaptchaMissing") }

    const parsedValues = signInSchema.safeParse(values)

    if (!parsedValues.success) return { error: tAuth("invalidData") }

    const { username, password } = parsedValues.data
    const [verify, userCollection] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUserCollection(),
    ])
    const existingUser = await userCollection.findOne({ username })

    if (!verify) return { error: tAuth("recaptchaFailed") }
    if (!existingUser) return { error: tAuth("signInError") }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) return { error: tAuth("signInError") }

    await session.user.create(existingUser._id.toString(), existingUser.locale)

    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)
    const tAuth = await getTranslations("auth")
    return { error: tAuth("signInFailed") }
  }
}

export async function signOut() {
  try {
    await session.user.delete()
    const tAuth = await getTranslations("auth")
    return { success: tAuth("signOutSuccess"), error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    const tAuth = await getTranslations("auth")
    return { error: tAuth("signOutFailed") }
  }
}

export async function getUser() {
  try {
    const tAuth = await getTranslations("auth")
    const { userId } = await session.user.get()

    if (!userId) {
      return {
        error: tAuth("accessDenied"),
      }
    }

    const userCollection = await getUserCollection()
    const existingUser = await userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    if (!existingUser) return { error: tAuth("userNotFound") }

    const user = { ...existingUser, _id: existingUser._id.toString() } as Omit<
      User,
      "password"
    >

    return { user }
  } catch (error) {
    console.error("Error fetching user: ", error)
    const tAuth = await getTranslations("auth")
    return {
      error: tAuth("userFetchFailed"),
    }
  }
}
