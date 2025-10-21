import { insertTestUser } from "@/tests/helpers/database"
import { user, validSignInValues } from "@/tests/helpers/test-data"
import { mockUserCollectionError } from "@/tests/mocks/collections.mock"
import {
  mockRecaptchaError,
  mockRecaptchaFailure,
  mockRecaptchaSuccess,
} from "@/tests/mocks/recaptcha.mock"
import {
  mockAuthenticatedUser,
  mockSignOutFailure,
  mockSignOutSuccess,
  mockUnauthenticatedUser,
} from "@/tests/mocks/session.mock"
import { getUser, signIn, signOut } from "@/actions/auth"

describe("Auth Actions", () => {
  describe("signIn", () => {
    it("should return error when recaptcha token is missing", async () => {
      const result = await signIn(validSignInValues, null)

      expect(result.error).toBe("Thiếu token recaptcha!")
    })

    it("should return error with invalid input data", async () => {
      mockRecaptchaSuccess()

      const result = await signIn({ username: "", password: "" }, "valid-token")

      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when recaptcha verification fails", async () => {
      mockRecaptchaFailure()

      const result = await signIn(validSignInValues, "invalid-token")

      expect(result.error).toBe("Xác thực Captcha thất bại!")
    })

    it("should return error when user does not exist", async () => {
      mockRecaptchaSuccess()

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })

    it("should return error with incorrect password", async () => {
      await insertTestUser(user)
      mockRecaptchaSuccess()

      const result = await signIn(
        { username: "testuser", password: "WrongPassword123!" },
        "valid-token"
      )

      expect(result.error).toBe("Tên người dùng hoặc mật khẩu không đúng!")
    })

    it("should successfully sign in with valid credentials", async () => {
      await insertTestUser(user)
      mockRecaptchaSuccess()

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBeUndefined()
    })

    it("should return error when recaptcha verification throws error", async () => {
      mockRecaptchaError()

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Đăng nhập thất bại! Vui lòng thử lại sau.")
    })

    it("should return error when database operation throws error", async () => {
      mockRecaptchaSuccess()
      mockUserCollectionError()

      const result = await signIn(validSignInValues, "valid-token")

      expect(result.error).toBe("Đăng nhập thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSignOutSuccess()

      const result = await signOut()

      expect(result.success).toBe("Bạn cần đăng nhập lại.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when sign out fails", async () => {
      mockSignOutFailure()

      const result = await signOut()

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Đăng xuất thất bại! Vui lòng thử lại sau.")
    })
  })

  describe("getUser", () => {
    it("should return error when user is not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error when user not found in database", async () => {
      mockAuthenticatedUser()

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe("Không tìm thấy người dùng!")
    })

    it("should return user data when authenticated", async () => {
      await insertTestUser(user)
      mockAuthenticatedUser()

      const result = await getUser()

      expect(result.user).toBeDefined()
      expect(result.user?.fullName).toBe("Test User")
      expect(result.user?.username).toBe("testuser")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(
        "Không thể tải thông tin người dùng! Vui lòng thử lại sau."
      )
    })
  })
})
