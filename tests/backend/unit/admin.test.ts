import { ObjectId } from "mongodb"

import { insertTestUser } from "@/tests/backend/helpers/database"
import {
  mockAuthenticatedAdmin,
  mockAuthenticatedSuperAdmin,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockAdminUser,
  mockAnotherUser,
  mockSuperAdminUser,
  mockUser,
} from "@/tests/shared/data"
import {
  deleteUser,
  getAdminStats,
  listUsers,
  setUserPassword,
  updateUserRole,
} from "@/actions/admin.actions"

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      removeUser: vi.fn().mockResolvedValue({ status: true }),
      setRole: vi.fn().mockResolvedValue({ status: true }),
      setUserPassword: vi.fn().mockResolvedValue({ status: true }),
    },
  },
}))

describe("Admin Actions", () => {
  describe("getAdminStats", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getAdminStats()

      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Access denied! Admin privileges required.")
    })

    it("should return error when user is not an admin", async () => {
      mockAuthenticatedUser()

      const result = await getAdminStats()

      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Access denied! Admin privileges required.")
    })

    it("should return correct stats when admin is authenticated", async () => {
      mockAuthenticatedAdmin()

      await Promise.all([
        insertTestUser(mockUser),
        insertTestUser(mockAnotherUser),
      ])

      const result = await getAdminStats()

      expect(result.error).toBeUndefined()
      expect(result.stats).toBeDefined()
      expect(result.stats?.totalUsers).toBeGreaterThanOrEqual(2)
      expect(result.stats?.activeUsers).toBeGreaterThanOrEqual(2)
    })
  })

  describe("listUsers", () => {
    it("should return error for non-admin user", async () => {
      mockAuthenticatedUser()

      const result = await listUsers()

      expect(result.users).toBeUndefined()
      expect(result.error).toBe("Access denied! Admin privileges required.")
    })

    it("should return list of users for admin", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockUser)

      const result = await listUsers()

      expect(result.error).toBeUndefined()
      expect(result.users).toBeDefined()
      expect(Array.isArray(result.users)).toBe(true)
      expect(result.total).toBeGreaterThanOrEqual(1)
      expect(result.users?.some((u) => u.name === "Test User")).toBe(true)

      const foundUser = result.users?.find((u) => u.name === "Test User")

      expect(foundUser).toHaveProperty("id")
      expect(foundUser).not.toHaveProperty("_id")
    })
  })

  describe("deleteUser", () => {
    it("should return error for invalid user ID", async () => {
      mockAuthenticatedAdmin()

      const result = await deleteUser("invalid-id")

      expect(result.error).toBe("Invalid user ID!")
      expect(result.success).toBeUndefined()
    })

    it("should return error when target user is not found", async () => {
      mockAuthenticatedAdmin()

      const nonExistentId = new ObjectId().toString()
      const result = await deleteUser(nonExistentId)

      expect(result.error).toBe("User not found!")
      expect(result.success).toBeUndefined()
    })

    it("should prevent admin from deleting themselves", async () => {
      mockAuthenticatedAdmin()

      const result = await deleteUser("68f712e4cda4897217a05a99")

      expect(result.error).toBe("You cannot delete your own account!")
    })

    it("should prevent admin from deleting superadmin account", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockSuperAdminUser)

      const result = await deleteUser(mockSuperAdminUser._id.toString())
      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should successfully delete target user", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockAnotherUser)

      const result = await deleteUser(mockAnotherUser._id.toString())

      expect(result.error).toBeUndefined()
      expect(result.success).toBe("User has been deleted.")
    })

    it("should allow superadmin to delete an admin or user account", async () => {
      mockAuthenticatedSuperAdmin()

      await Promise.all([
        insertTestUser(mockAdminUser),
        insertTestUser(mockAnotherUser),
      ])

      const [adminResult, userResult] = await Promise.all([
        deleteUser(mockAdminUser._id.toString()),
        deleteUser(mockAnotherUser._id.toString()),
      ])

      expect(adminResult.error).toBeUndefined()
      expect(adminResult.success).toBe("User has been deleted.")
      expect(userResult.error).toBeUndefined()
      expect(userResult.success).toBe("User has been deleted.")
    })
  })

  describe("updateUserRole", () => {
    it("should return error for non-admin user", async () => {
      mockAuthenticatedUser()

      const result = await updateUserRole(
        mockAnotherUser._id.toString(),
        "user"
      )

      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should return error when trying to change own role", async () => {
      mockAuthenticatedAdmin()

      const result = await updateUserRole(mockAdminUser._id.toString(), "user")

      expect(result.error).toBe("You cannot change your own role!")
      expect(result.success).toBeUndefined()
    })

    it("should prevent regular admin from modifying role of another admin", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockSuperAdminUser)

      const result = await updateUserRole(
        mockSuperAdminUser._id.toString(),
        "user"
      )

      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should prevent regular admin from promoting user to admin", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockAnotherUser)

      const result = await updateUserRole(
        mockAnotherUser._id.toString(),
        "admin"
      )

      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should allow superadmin to change user role to admin", async () => {
      mockAuthenticatedSuperAdmin()

      await insertTestUser(mockAnotherUser)

      const result = await updateUserRole(
        mockAnotherUser._id.toString(),
        "admin"
      )

      expect(result.error).toBeUndefined()
      expect(result.success).toBe("User role has been updated.")
    })
  })

  describe("setUserPassword", () => {
    it("should return error for non-admin user", async () => {
      mockAuthenticatedUser()

      const result = await setUserPassword(mockAnotherUser._id.toString(), {
        password: "NewPassword123!",
      })

      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should prevent regular admin from resetting password of another admin", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockSuperAdminUser)

      const result = await setUserPassword(mockSuperAdminUser._id.toString(), {
        password: "NewPassword123!",
      })

      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(result.success).toBeUndefined()
    })

    it("should allow admin to reset password of regular user", async () => {
      mockAuthenticatedAdmin()

      await insertTestUser(mockAnotherUser)

      const result = await setUserPassword(mockAnotherUser._id.toString(), {
        password: "NewPassword123!",
      })

      expect(result.error).toBeUndefined()
      expect(result.success).toBe("Password has been updated.")
    })
  })
})
