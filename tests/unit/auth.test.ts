import { beforeEach, describe, expect, it, vi } from "vitest"

import { insertTestUser } from "@/tests/helpers/database"
import {
  createTestUser,
  testUserId,
  validSignInValues,
} from "@/tests/helpers/test-data"
import {
  clearRecaptchaMock,
  mockVerifyRecaptchaToken,
  setRecaptchaSuccess,
} from "@/tests/mocks/recaptcha.mock"
import {
  clearMockSession,
  createMockSession,
  mockSession,
} from "@/tests/mocks/session.mock"
import { getUser, signIn, signOut } from "@/actions/auth"

vi.mock("@/lib/session", () => ({ session: mockSession }))
vi.mock("@/lib/recaptcha", () => ({
  verifyRecaptchaToken: mockVerifyRecaptchaToken,
}))

describe("Auth Actions", () => {
  beforeEach(() => {
    clearMockSession()
    clearRecaptchaMock()
    vi.clearAllMocks()
  })

  describe("signIn", () => {
    it("should successfully sign in with valid credentials", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      setRecaptchaSuccess(true)

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBeUndefined()
      expect(mockSession.user.create).toHaveBeenCalled()
    })

    it("should return error when recaptcha token is missing", async () => {
      const result = await signIn(validSignInValues, null)

      expect(result.error).toBe("Thiếu token recaptcha!")
      expect(mockSession.user.create).not.toHaveBeenCalled()
    })

    it("should return error when recaptcha verification fails", async () => {
      setRecaptchaSuccess(false)

      const result = await signIn(validSignInValues, "invalid-token")

      expect(result.error).toBe("Xác thực Captcha thất bại!")
    })

    it("should return error with invalid input data", async () => {
      setRecaptchaSuccess(true)

      const result = await signIn({ username: "", password: "" }, "valid-token")

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when user does not exist", async () => {
      setRecaptchaSuccess(true)

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })

    it("should return error with incorrect password", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      setRecaptchaSuccess(true)

      const result = await signIn(
        { username: "testuser", password: "WrongPassword123!" },
        "valid-token"
      )

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSession.user.delete.mockResolvedValue(undefined)

      const result = await signOut()

      expect(result.success).toBe("Bạn cần đăng nhập lại.")
      expect(result.error).toBeUndefined()
      expect(mockSession.user.delete).toHaveBeenCalled()
    })

    it("should return error when sign out fails", async () => {
      mockSession.user.delete.mockRejectedValue(new Error("Session error"))

      const result = await signOut()

      expect(result.error).toBe("Đăng xuất thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("getUser", () => {
    it("should return error when user is not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await getUser()

      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
      expect(result.user).toBeUndefined()
    })

    it("should return error when user not found in database", async () => {
      createMockSession(testUserId)

      const result = await getUser()

      expect(result.error).toBe("Không tìm thấy người dùng!")
    })

    it("should return user data when authenticated", async () => {
      const testUser = await createTestUser()
      await insertTestUser(testUser)
      createMockSession(testUser._id.toString())

      const result = await getUser()

      expect(result.user).toBeDefined()
      expect(result.user?.username).toBe("testuser")
      expect(result.error).toBeUndefined()
    })
  })
})
