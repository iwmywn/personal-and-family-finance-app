"use server"

import { headers } from "next/headers"
import { ObjectId } from "mongodb"
import { getExtracted } from "next-intl/server"

import { getCurrentSession } from "@/actions/session.actions"
import { auth } from "@/lib/auth"
import {
  getBudgetsCollection,
  getCategoriesCollection,
  getGoalsCollection,
  getRecurringTransactionsCollection,
  getTransactionsCollection,
  getUsersCollection,
} from "@/lib/collections"
import { withTransaction } from "@/lib/db"
import type { ActionResponse, User } from "@/lib/definitions"
import {
  ADMIN_ROLES,
  DEFAULT_ROLE,
  isAdminRole,
  isSuperAdminRole,
} from "@/lib/role"
import type { AssignableRole } from "@/lib/role"
import { getSchemas } from "@/schemas/server"
import type {
  AdminPasswordFormValues,
  AdminUserFormValues,
} from "@/schemas/types"

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  adminUsers: number
}

async function verifyAdmin() {
  const session = await getCurrentSession()

  if (!session || !isAdminRole(session.user.role)) {
    return null
  }

  return session
}

export async function createUser(
  values: AdminUserFormValues
): Promise<ActionResponse> {
  const t = await getExtracted()

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    const { createAdminUserSchema } = await getSchemas()
    const parsed = createAdminUserSchema().safeParse(values)

    if (!parsed.success) {
      return { error: t("Invalid data!") }
    }

    const isCurrentSuperAdmin = isSuperAdminRole(session.user.role)
    const assignedRole = isCurrentSuperAdmin ? parsed.data.role : DEFAULT_ROLE

    await auth.api.createUser({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
        role: assignedRole,
        data: {
          username: parsed.data.username,
          emailVerified: true,
        },
      },
    })

    return { success: t("User has been created.") }
  } catch (error) {
    console.error("Error creating user:", error)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      return { error: t("This email is already in use.") }
    }
    return { error: t("Failed to create user! Please try again later.") }
  }
}

export async function getAdminStats(): Promise<{
  error?: string
  stats?: {
    totalUsers: number
    activeUsers: number
    bannedUsers: number
    adminUsers: number
  }
}> {
  const t = await getExtracted()

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    const usersCollection = await getUsersCollection()
    const [totalUsers, bannedUsers, adminUsers] = await Promise.all([
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ banned: true }),
      usersCollection.countDocuments({
        role: { $in: [...ADMIN_ROLES] },
      }),
    ])

    const activeUsers = Math.max(0, totalUsers - bannedUsers)

    return {
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
      },
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return { error: t("Failed to fetch admin stats! Please try again later.") }
  }
}

export async function listUsers(): Promise<{
  error?: string
  users?: User[]
  total?: number
}> {
  const t = await getExtracted()

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    const usersCollection = await getUsersCollection()
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return {
      users: users.map(({ _id, ...user }) => ({
        ...user,
        id: _id.toString(),
      })),
      total: users.length,
    }
  } catch (error) {
    console.error("Error listing users:", error)
    return { error: t("Failed to load users! Please try again later.") }
  }
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  const [t, headersList] = await Promise.all([getExtracted(), headers()])

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    if (!ObjectId.isValid(userId)) {
      return {
        error: t("Invalid user ID!"),
      }
    }

    if (session.user.id === userId) {
      return { error: t("You cannot delete your own account!") }
    }

    const userObjectId = new ObjectId(userId)
    const usersCollection = await getUsersCollection()
    const targetUser = await usersCollection.findOne({ _id: userObjectId })

    if (!targetUser) {
      return { error: t("User not found!") }
    }

    if (session.user.role === "admin" && isAdminRole(targetUser.role)) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    const [
      transactionsCollection,
      categoriesCollection,
      budgetsCollection,
      goalsCollection,
      recurringCollection,
    ] = await Promise.all([
      getTransactionsCollection(),
      getCategoriesCollection(),
      getBudgetsCollection(),
      getGoalsCollection(),
      getRecurringTransactionsCollection(),
    ])

    await withTransaction(async (dbSession) => {
      await transactionsCollection.deleteMany(
        { userId: userObjectId },
        { session: dbSession }
      )
      await categoriesCollection.deleteMany(
        { userId: userObjectId },
        { session: dbSession }
      )
      await budgetsCollection.deleteMany(
        { userId: userObjectId },
        { session: dbSession }
      )
      await goalsCollection.deleteMany(
        { userId: userObjectId },
        { session: dbSession }
      )
      await recurringCollection.deleteMany(
        { userId: userObjectId },
        { session: dbSession }
      )
    })

    await auth.api.removeUser({
      body: {
        userId,
      },
      headers: headersList,
    })

    return { success: t("User has been deleted.") }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: t("Failed to delete user! Please try again later.") }
  }
}

export async function setUserRole(
  userId: string,
  role: AssignableRole
): Promise<ActionResponse> {
  const [t, headersList] = await Promise.all([getExtracted(), headers()])

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    if (!ObjectId.isValid(userId)) {
      return {
        error: t("Invalid user ID!"),
      }
    }

    const { createAdminRoleSchema } = await getSchemas()
    const parsed = createAdminRoleSchema().safeParse({ role })

    if (!parsed.success) {
      return { error: t("Invalid data!") }
    }

    if (session.user.id === userId) {
      return { error: t("You cannot change your own role!") }
    }

    const usersCollection = await getUsersCollection()
    const targetUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!targetUser) {
      return { error: t("User not found!") }
    }

    if (
      session.user.role === "admin" &&
      (isAdminRole(targetUser.role) || role === "admin")
    ) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: headersList,
    })

    return { success: t("User role has been updated.") }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { error: t("Failed to update user role! Please try again later.") }
  }
}

export async function setUserPassword(
  userId: string,
  values: AdminPasswordFormValues
): Promise<ActionResponse> {
  const [t, headersList] = await Promise.all([getExtracted(), headers()])

  try {
    const session = await verifyAdmin()

    if (!session) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    if (!ObjectId.isValid(userId)) {
      return {
        error: t("Invalid user ID!"),
      }
    }

    const { createAdminPasswordSchema } = await getSchemas()
    const parsed = createAdminPasswordSchema().safeParse(values)

    if (!parsed.success) {
      return { error: t("Invalid data!") }
    }

    const usersCollection = await getUsersCollection()
    const targetUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!targetUser) {
      return { error: t("User not found!") }
    }

    if (session.user.role === "admin" && isAdminRole(targetUser.role)) {
      return { error: t("Access denied! Admin privileges required.") }
    }

    await auth.api.setUserPassword({
      body: {
        userId,
        newPassword: parsed.data.password,
      },
      headers: headersList,
    })

    return { success: t("Password has been updated.") }
  } catch (error) {
    console.error("Error setting user password:", error)
    return { error: t("Failed to set user password! Please try again later.") }
  }
}
