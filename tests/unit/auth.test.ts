import { beforeEach, describe, expect, it, vi } from "vitest"

import { insertTestUser } from "@/tests/helpers/database"
import { user1, validSignInValues } from "@/tests/helpers/test-data"
import {
  mockVerifyRecaptchaToken,
  setRecaptchaSuccess,
} from "@/tests/mocks/recaptcha.mock"
import { mockSession } from "@/tests/mocks/session.mock"
import { getUser, signIn, signOut } from "@/actions/auth"
import * as dataLib from "@/lib/data"

vi.mock("@/lib/session", () => ({ session: mockSession }))
vi.mock("@/lib/recaptcha", () => ({
  verifyRecaptchaToken: mockVerifyRecaptchaToken,
}))

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("signIn", () => {
    it("should return error when recaptcha token is missing", async () => {
      const result = await signIn(validSignInValues, null)

      expect(result.error).toBe("Thiếu token recaptcha!")
    })

    it("should return error with invalid input data", async () => {
      setRecaptchaSuccess(true)

      const result = await signIn({ username: "", password: "" }, "valid-token")

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when recaptcha verification fails", async () => {
      setRecaptchaSuccess(false)

      const result = await signIn(validSignInValues, "invalid-token")

      expect(result.error).toBe("Xác thực Captcha thất bại!")
    })

    it("should return error when user does not exist", async () => {
      setRecaptchaSuccess(true)

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })

    it("should return error with incorrect password", async () => {
      await insertTestUser(user1)
      setRecaptchaSuccess(true)

      const result = await signIn(
        { username: "testuser", password: "WrongPassword123!" },
        "valid-token"
      )

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })

    it("should successfully sign in with valid credentials", async () => {
      await insertTestUser(user1)
      setRecaptchaSuccess(true)

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBeUndefined()
    })

    it("should return error when recaptcha verification throws error", async () => {
      mockVerifyRecaptchaToken.mockRejectedValue(
        new Error("Recaptcha service error")
      )

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Đăng nhập thất bại! Vui lòng thử lại sau.")
    })

    it("should return error when getUserByUsername throws error", async () => {
      setRecaptchaSuccess(true)
      vi.spyOn(dataLib, "getUserByUsername").mockRejectedValue(
        new Error("Database error")
      )

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Đăng nhập thất bại! Vui lòng thử lại sau.")
    })

    it("should return error when session creation fails", async () => {
      await insertTestUser(user1)
      setRecaptchaSuccess(true)
      mockSession.user.create.mockRejectedValue(new Error("Session error"))

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Đăng nhập thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSession.user.delete.mockResolvedValue(undefined)

      const result = await signOut()

      expect(result.success).toBe("Bạn cần đăng nhập lại.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when sign out fails", async () => {
      mockSession.user.delete.mockRejectedValue(new Error("Session error"))

      const result = await signOut()

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Đăng xuất thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("getUser", () => {
    it("should return error when user is not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error when user not found in database", async () => {
      mockSession.user.get.mockResolvedValue({ userId: user1._id.toString() })

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Không tìm thấy người dùng!")
    })

    it("should return user data when authenticated", async () => {
      await insertTestUser(user1)
      mockSession.user.get.mockResolvedValue({ userId: user1._id.toString() })

      const result = await getUser()

      expect(result.user).toBeDefined()
      expect(result.user?.fullName).toBe("Test User 1")
      expect(result.user?.username).toBe("testuser1")
      expect(result.error).toBeUndefined()
    })

    it("should return error when fetching user from session fails", async () => {
      mockSession.user.get.mockRejectedValue(new Error("Session error"))

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(
        "Không thể tải thông tin người dùng! Vui lòng thử lại sau."
      )
    })

    it("should return error when getUserById throws error", async () => {
      mockSession.user.get.mockResolvedValue({ userId: user1._id.toString() })
      vi.spyOn(dataLib, "getUserById").mockRejectedValue(
        new Error("Database error")
      )

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(
        "Không thể tải thông tin người dùng! Vui lòng thử lại sau."
      )
    })
  })
})
