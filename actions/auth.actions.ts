"use server"

import { cacheTag, updateTag } from "next/cache"
import { headers } from "next/headers"
import { createSignInSchema, type SignInFormValues } from "@/schemas"
import { APIError } from "better-auth"
import { ObjectId } from "mongodb"
import { getTranslations } from "next-intl/server"

import type { TypedTranslationFunction } from "@/i18n/types"
import { auth } from "@/lib/auth"
import { getUsersCollection } from "@/lib/collections"
import { type User } from "@/lib/definitions"
import { verifyRecaptchaToken } from "@/lib/recaptcha"

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
    const [verify] = await Promise.all([
      verifyRecaptchaToken(recaptchaToken),
      getUsersCollection(),
    ])

    if (!verify) return { error: t("auth.be.recaptchaFailed") }

    // await auth.api.signUpEmail({
    //   body: {
    //     email: "email2@domain.com",
    //     name: "Test User",
    //     password: "Password@1234",
    //     username: "betterauthusername2",
    //   },
    // })

    const result = await auth.api.signInUsername({
      body: {
        username: username,
        password: password,
      },
    })

    console.log(result)

    // await setUserLocale(result?.user.locale)
    updateTag("user")
    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)

    if (error instanceof APIError && error.statusCode === 401)
      return { error: t("auth.be.signInError") }

    if (error) return { error: t("auth.be.signInFailed") }
  }
}

export async function signOut() {
  const t = await getTranslations()

  try {
    await auth.api.signOut({
      headers: await headers(),
    })

    return { success: t("auth.be.signOutSuccess"), error: undefined }
  } catch (error) {
    console.error("Error signing out: ", error)
    return { error: t("auth.be.signOutFailed") }
  }
}

export async function getUser(userId: string, t: TypedTranslationFunction) {
  "use cache: private"
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

export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    return session
  } catch (error) {
    console.error("Error getting session: ", error)
    return null
  }
}
