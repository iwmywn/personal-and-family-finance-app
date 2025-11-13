import bcrypt from "bcryptjs"
import { getTranslations } from "next-intl/server"

import { insertTestUser } from "@/tests/backend/helpers/database"
import { mockUserCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockUser, mockValidPasswordValues } from "@/tests/shared/data"
import { updatePassword } from "@/actions/account.actions"
import { getUsersCollection } from "@/lib/collections"

describe("Account", async () => {
  const t = await getTranslations()

  describe("updatePassword", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid input data", async () => {
      mockAuthenticatedUser()

      const result = await updatePassword({
        currentPassword: "TestPassword123!",
        newPassword: "weak",
        confirmPassword: "weak",
      })

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when user not found", async () => {
      mockAuthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.userNotFound"))
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
      expect(result.error).toBe(t("settings.be.passwordIncorrect"))
    })

    it("should return success when no changes are made", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await updatePassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      expect(result.success).toBe(t("settings.be.noChanges"))
      expect(result.error).toBeUndefined()
    })

    it("should successfully update password", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await updatePassword(mockValidPasswordValues)
      const usersCollection = await getUsersCollection()
      const updatedUser = await usersCollection.findOne({ _id: mockUser._id })

      expect(updatedUser).not.toBe(null)
      expect(
        await bcrypt.compare("TestPassword123!", updatedUser!.password)
      ).toBe(false)
      expect(
        await bcrypt.compare("NewPassword456!", updatedUser!.password)
      ).toBe(true)
      expect(result.success).toBe(t("settings.be.passwordUpdated"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const result = await updatePassword(mockValidPasswordValues)

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("settings.be.passwordUpdateFailed"))
    })
  })
})
