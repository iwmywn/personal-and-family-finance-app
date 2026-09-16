import { headers } from "next/headers"

import {
  mockAuthenticatedAdmin,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import {
  mockAdminUser,
  mockBannedUser,
  mockUser,
  mockUsers,
} from "@/tests/shared/data"
import { getAdminData } from "@/actions/admin.actions"
import { auth } from "@/lib/auth"
import type { User } from "@/lib/definitions"

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      listUsers: vi.fn(),
    },
  },
}))

type UserWithRole = NonNullable<
  Awaited<ReturnType<typeof auth.api.listUsers>>
>["users"][number]

const toUserWithRole = (u: User): UserWithRole => ({
  ...u,
  banned: u.banned ?? null,
})

describe("Admin", () => {
  describe("getAdminData", () => {
    it("should handle error when headers() throws", async () => {
      vi.mocked(headers).mockRejectedValueOnce(new Error("Headers unavailable"))

      const result = await getAdminData()

      expect(result.users).toBeUndefined()
      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Failed to list users! Please try again later.")
      expect(auth.api.listUsers).not.toHaveBeenCalled()
    })

    it("should return access denied error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getAdminData()

      expect(result.users).toBeUndefined()
      expect(result.stats).toBeUndefined()
      expect(result.error).toBe(
        "Access denied! Please refresh the page and try again."
      )
      expect(auth.api.listUsers).not.toHaveBeenCalled()
    })

    it("should return access denied error when user is not an admin", async () => {
      mockAuthenticatedUser()

      const result = await getAdminData()

      expect(result.users).toBeUndefined()
      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Access denied! Admin privileges required.")
      expect(auth.api.listUsers).not.toHaveBeenCalled()
    })

    it("should handle error when auth.api.listUsers throws", async () => {
      vi.mocked(auth.api.listUsers).mockRejectedValueOnce(
        new Error("Better Auth service error")
      )

      const result = await getAdminData()

      expect(result.users).toBeUndefined()
      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Failed to list users! Please try again later.")
    })

    it("should handle null result from auth.api.listUsers", async () => {
      // @ts-expect-error - Testing null response
      vi.mocked(auth.api.listUsers).mockResolvedValueOnce(null)

      const result = await getAdminData()

      expect(result.users).toBeUndefined()
      expect(result.stats).toBeUndefined()
      expect(result.error).toBe("Failed to list users! Please try again later.")
    })

    it("should successfully return users and calculated admin stats", async () => {
      mockAuthenticatedAdmin()

      vi.mocked(headers).mockResolvedValue(new Headers())

      vi.mocked(auth.api.listUsers).mockResolvedValueOnce({
        users: mockUsers.map(toUserWithRole),
        total: mockUsers.length,
      })

      const result = await getAdminData()

      expect(result.error).toBeUndefined()
      expect(result.users).toEqual(mockUsers)
      expect(result.stats).toEqual({
        totalUsers: 4,
        activeUsers: 3,
        bannedUsers: 1,
        adminUsers: 1,
      })
      expect(auth.api.listUsers).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        query: {
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      })
    })

    it("should correctly calculate stats when all users are active", async () => {
      mockAuthenticatedAdmin()

      const activeUsers = [mockUser, mockAdminUser]
      vi.mocked(auth.api.listUsers).mockResolvedValueOnce({
        users: activeUsers.map(toUserWithRole),
        total: activeUsers.length,
      })

      const result = await getAdminData()

      expect(result.error).toBeUndefined()
      expect(result.users).toEqual(activeUsers)
      expect(result.stats).toEqual({
        totalUsers: 2,
        activeUsers: 2,
        bannedUsers: 0,
        adminUsers: 1,
      })
    })

    it("should correctly calculate stats when all users are banned", async () => {
      mockAuthenticatedAdmin()

      const bannedUsers: User[] = [
        mockBannedUser,
        { ...mockUser, id: "user-banned-2", banned: true },
      ]
      vi.mocked(auth.api.listUsers).mockResolvedValueOnce({
        users: bannedUsers.map(toUserWithRole),
        total: bannedUsers.length,
      })

      const result = await getAdminData()

      expect(result.error).toBeUndefined()
      expect(result.stats).toEqual({
        totalUsers: 2,
        activeUsers: 0,
        bannedUsers: 2,
        adminUsers: 0,
      })
    })

    it("should return empty stats when users array is empty", async () => {
      mockAuthenticatedAdmin()

      vi.mocked(auth.api.listUsers).mockResolvedValueOnce({
        users: [],
        total: 0,
      })

      const result = await getAdminData()

      expect(result.error).toBeUndefined()
      expect(result.users).toEqual([])
      expect(result.stats).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        adminUsers: 0,
      })
    })
  })
})
