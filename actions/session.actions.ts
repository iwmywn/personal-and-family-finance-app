"use server"

import { headers } from "next/headers"
import { connection } from "next/server"

import { auth } from "@/lib/auth"

export async function getCurrentSession() {
  await connection()

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

export async function getSessions() {
  await connection()

  try {
    const activeSessions = await auth.api.listSessions({
      headers: await headers(),
    })

    return activeSessions
  } catch (error) {
    console.error("Error getting session: ", error)
    return null
  }
}
