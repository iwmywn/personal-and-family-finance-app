import { getTranslations } from "next-intl/server"

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

      const tCommonBE = await getTranslations("common.be")

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "weak",
        confirmPassword: "weak",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error when user not found", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("userNotFound"))
    })

    it("should return error with incorrect current password", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updatePassword({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword456!",
        confirmPassword: "NewPassword456!",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tSettingsBE("passwordIncorrect"))
    })

    it("should return success when no changes are made", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updatePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      expect(result.success).toBe(tSettingsBE("noChanges"))
      expect(result.error).toBeUndefined()
    })

    it("should successfully update password", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBe(tSettingsBE("passwordUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tSettingsBE("passwordUpdateFailed"))
    })
  })
})
