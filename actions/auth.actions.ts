"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { createSignInSchema, type SignInFormValues } from "@/schemas"
import { APIError } from "better-auth"
import { getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"

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
    const requestHeaders = new Headers(await headers())
    requestHeaders.set("x-captcha-response", recaptchaToken) // this doesn't work

    await auth.api.signInUsername({
      body: {
        username,
        password,
      },
      headers: requestHeaders,
    })

    updateTag("user")
    return { error: undefined }
  } catch (error) {
    console.error("Error signing in: ", error)

    if (error instanceof APIError && error.statusCode === 401)
      return { error: t("auth.be.signInError") }
    else return { error: t("auth.be.signInFailed") }
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
