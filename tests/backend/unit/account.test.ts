import { insertTestUser } from "@/tests/backend/helpers/database"
import { mockUserCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockUser, mockValidPasswordValues } from "@/tests/shared/data"
import { updatePassword } from "@/actions/account"

describe("Account Actions", () => {
  describe("updatePassword", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "weak",
        confirmPassword: "weak",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when user not found", async () => {
      mockAuthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Không tìm thấy người dùng!")
    })

    it("should return error with incorrect current password", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword456!",
        confirmPassword: "NewPassword456!",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Mật khẩu hiện tại không đúng!")
    })

    it("should return success when no changes are made", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await updatePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      expect(result.success).toBe("Không có thay đổi nào được thực hiện.")
      expect(result.error).toBeUndefined()
    })

    it("should successfully update password", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBe("Mật khẩu của bạn đã được thay đổi.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Cập nhật mật khẩu thất bại! Vui lòng thử lại sau."
      )
    })
  })
})
