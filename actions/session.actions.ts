"use server"

import { cache } from "react"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"
import type { ActionResponse, Session, User } from "@/lib/definitions"

export const getCurrentSession = cache(
  async (): Promise<{ user: User; session: Session } | null> => {
    const headersList = await headers()

    try {
      const session = await auth.api.getSession({
        headers: headersList,
      })

      if (!session) return null

      return {
        user: session.user,
        session: {
          ...session.session,
          token: "",
        },
      }
    } catch (error) {
      console.error("Error getting session: ", error)
      return null
    }
  }
)

export const getActiveSessions = cache(async (): Promise<Session[] | null> => {
  const headersList = await headers()

  try {
    const activeSessions = await auth.api.listSessions({
      headers: headersList,
    })

    if (!activeSessions) return []

    return activeSessions.map((session) => ({
      ...session,
      token: "",
    }))
  } catch (error) {
    console.error("Error getting session: ", error)
    return null
  }
})

export async function revokeSessionById(
  sessionId: string
): Promise<ActionResponse> {
  const [t, headersList] = await Promise.all([getTranslations(), headers()])

  try {
    const activeSessions = await auth.api.listSessions({
      headers: headersList,
    })

    const targetSession = activeSessions?.find((s) => s.id === sessionId)
    if (!targetSession) {
      return { error: t("Session not found.") }
    }

    await auth.api.revokeSession({
      body: {
        token: targetSession.token,
      },
      headers: headersList,
    })

    return { success: t("Session terminated.") }
  } catch (error) {
    console.error("Error revoking session: ", error)
    return { error: t("Failed to terminate session! Please try again later.") }
  }
}
