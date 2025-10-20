import { beforeEach, describe, expect, it, vi } from "vitest"

import { insertTestUser } from "@/tests/helpers/database"
import {
  createTestUser,
  testUserId,
  validPasswordValues,
} from "@/tests/helpers/test-data"
import {
  clearMockSession,
  createMockSession,
  mockSession,
} from "@/tests/mocks/session.mock"
import { updatePassword } from "@/actions/settings/account"

vi.mock("@/lib/session", () => ({ session: mockSession }))

describe("Settings Actions", () => {
  beforeEach(() => {
    clearMockSession()
    vi.clearAllMocks()
  })

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      createMockSession(testUserId)

      const result = await updatePassword(validPasswordValues)

      expect(result.success).toBe("Mật khẩu của bạn đã được thay đổi.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await updatePassword(validPasswordValues)

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      createMockSession(testUserId)

      const result = await updatePassword({
        currentPassword: "",
        newPassword: "",
      } as Record<string, unknown>)

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error with incorrect current password", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      createMockSession(testUserId)

      const result = await updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword456!",
      })

      expect(result.error).toBe("Mật khẩu hiện tại không đúng!")
    })

    it("should validate new password strength", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      createMockSession(testUserId)

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "weak",
      })

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return message when password is unchanged", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      createMockSession(testUserId)

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "TestPassword123!", // Same password
      })

      expect(result.success).toBe("Không có thay đổi nào được thực hiện.")
    })
  })
})
