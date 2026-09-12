"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"

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

export async function getActiveSessions() {
  try {
    const activeSessions = await auth.api.listSessions({
      headers: await headers(),
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
}

export async function revokeSessionById(sessionId: string): Promise<{
  error?: string
  success?: string
}> {
  // const [_, t] = await Promise.all([
  //   connection(),
  //   getTranslations()
  // ])

  const t = await getTranslations()

  try {
    const activeSessions = await auth.api.listSessions({
      headers: await headers(),
    })

    const targetSession = activeSessions?.find((s) => s.id === sessionId)
    if (!targetSession) {
      return { error: t("Session not found.") }
    }

    await auth.api.revokeSession({
      headers: await headers(),
      body: {
        token: targetSession.token,
      },
    })

    return { success: t("Session terminated.") }
  } catch (error) {
    console.error("Error revoking session: ", error)
    return { error: t("Failed to terminate session! Please try again later.") }
  }
}
