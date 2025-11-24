"use server"

import { headers } from "next/headers"
import { createPasswordSchema, type PasswordFormValues } from "@/schemas"
import { APIError } from "better-auth"
import { getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"

import { getCurrentSession } from "./session.actions"

export async function updatePassword(values: PasswordFormValues) {
  const t = await getTranslations()

  try {
    const session = await getCurrentSession()

    if (!session) {
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
    const requestHeaders = await headers()

    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: requestHeaders,
    })

    await auth.api.revokeOtherSessions({
      headers: requestHeaders,
    })

    return { success: t("settings.be.passwordUpdated") }
  } catch (error) {
    console.error("Error updating password:", error)

    if (error instanceof APIError && error.statusCode === 400)
      return { error: t("settings.be.passwordIncorrect") }
    else return { error: t("settings.be.passwordUpdateFailed") }
  }
}
