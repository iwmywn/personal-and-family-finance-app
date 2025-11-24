"use server"

import { cacheTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getCurrentSession() {
  "use cache: private"
  cacheTag("user")

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
