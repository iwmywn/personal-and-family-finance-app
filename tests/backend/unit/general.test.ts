import { getTranslations } from "next-intl/server"

import { insertTestUser } from "@/tests/backend/helpers/database"
import { mockUserCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockUser } from "@/tests/shared/data"
import { updateLocale } from "@/actions/general.actions"
import { setUserLocale } from "@/i18n/locale"
import { getUsersCollection } from "@/lib/collections"

describe("General", async () => {
  const t = await getTranslations()

  describe("updateLocale", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error with invalid locale", async () => {
      mockAuthenticatedUser()

      const result = await updateLocale("invalid" as "vi" | "en")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("settings.be.languageUpdateFailed"))
    })

    it("should return error when user not found in database", async () => {
      mockAuthenticatedUser()

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("common.be.userNotFound"))
    })

    it("should successfully update locale", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      vi.mock("@/i18n/locale", () => ({
        setUserLocale: vi.fn(),
      }))

      const result = await updateLocale("vi")
      const usersCollection = await getUsersCollection()
      const updatedUser = await usersCollection.findOne({
        _id: mockUser._id,
      })

      expect(setUserLocale).toHaveBeenCalledWith("vi")
      expect(updatedUser?.locale).toBe("vi")
      expect(result.success).toBe(t("settings.be.languageUpdated"))
      expect(result.error).toBeUndefined()

      vi.doUnmock("@/i18n/locale")
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("settings.be.languageUpdateFailed"))
    })
  })
})
