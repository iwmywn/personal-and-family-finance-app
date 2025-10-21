import { insertTestUser } from "@/tests/helpers/database"
import { user, validPasswordValues } from "@/tests/helpers/test-data"
import { mockSession } from "@/tests/mocks/session.mock"
import { updatePassword } from "@/actions/settings/account"
import * as collectionsLib from "@/lib/collections"

vi.mock("@/lib/session", () => ({ session: mockSession }))

describe("Settings Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("updatePassword", () => {
    it("should return error when not authenticated", async () => {
      mockSession.user.get.mockResolvedValue({ userId: null })

      const result = await updatePassword(validPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Không có quyền truy cập! Vui lòng tải lại trang và thử lại."
      )
    })

    it("should return error with invalid input data", async () => {
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "weak",
        confirmPassword: "weak",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Dữ liệu không hợp lệ!")
    })

    it("should return error when user not found", async () => {
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })

      const result = await updatePassword(validPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Không tìm thấy người dùng!")
    })

    it("should return error with incorrect current password", async () => {
      await insertTestUser(user)
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })

      const result = await updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword456!",
        confirmPassword: "NewPassword456!",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe("Mật khẩu hiện tại không đúng!")
    })

    it("should return success when no changes are made", async () => {
      await insertTestUser(user)
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })

      const result = await updatePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      expect(result.success).toBe("Không có thay đổi nào được thực hiện.")
      expect(result.error).toBeUndefined()
    })

    it("should successfully update password", async () => {
      await insertTestUser(user)
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })

      const result = await updatePassword(validPasswordValues)

      expect(result.success).toBe("Mật khẩu của bạn đã được thay đổi.")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockSession.user.get.mockResolvedValue({ userId: user._id.toString() })
      vi.spyOn(collectionsLib, "getUserCollection").mockRejectedValue(
        new Error("Database error")
      )

      const result = await updatePassword(validPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(
        "Cập nhật mật khẩu thất bại! Vui lòng thử lại sau."
      )
    })
  })
})
