"use server"

import { headers } from "next/headers"
import { getExtracted } from "next-intl/server"

import { auth } from "@/lib/auth"
import type { User } from "@/lib/definitions"

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  adminUsers: number
}

export async function getAdminData(): Promise<{
  error?: string
  users?: User[]
  stats?: AdminStats
}> {
  const t = await getExtracted()

  try {
    const headersList = await headers()
    const result = await auth.api.listUsers({
      headers: headersList,
      query: {
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    })

    if (!result)
      return { error: t("Failed to list users! Please try again later.") }

    const users = (result.users ?? []) as unknown as User[]
    const totalUsers = users.length
    const bannedUsers = users.filter((u) => Boolean(u.banned)).length
    const adminUsers = users.filter((u) => u.role === "admin").length
    const activeUsers = Math.max(0, totalUsers - bannedUsers)

    const stats: AdminStats = {
      totalUsers,
      activeUsers,
      bannedUsers,
      adminUsers,
    }

    return { users, stats }
  } catch (error) {
    console.error("Error listing users:", error)
    return {
      error: t("Failed to list users! Please try again later."),
    }
  }
}
