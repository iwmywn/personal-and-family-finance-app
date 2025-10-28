import { setUserLocale } from "@/i18n/locale"
import { getTranslations } from "next-intl/server"

import { insertTestUser } from "@/tests/backend/helpers/database"
import { mockUserCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockAuthenticatedUser,
  mockSession,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockUser } from "@/tests/shared/data"
import { updateLocale } from "@/actions/general"
import { getUsersCollection } from "@/lib/collections"

describe("General", () => {
  describe("updateLocale", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error with invalid locale", async () => {
      mockAuthenticatedUser()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updateLocale("invalid" as "vi" | "en")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tSettingsBE("languageUpdateFailed"))
    })

    it("should return error when user not found in database", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tCommonBE("userNotFound"))
    })

    it("should successfully update locale", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      vi.mock("@/i18n/locale", () => ({
        setUserLocale: vi.fn(),
      }))
      const mockSave = vi.fn().mockResolvedValue(undefined)
      const mockSessionData = {
        userId: mockUser._id.toString(),
        locale: "en",
        save: mockSave,
      }

      mockSession.user.get.mockResolvedValue(mockSessionData)
      const tSettingsBE = await getTranslations("settings.be")

      const result = await updateLocale("vi")
      const usersCollection = await getUsersCollection()
      const updatedUser = await usersCollection.findOne({
        _id: mockUser._id,
      })

      expect(mockSessionData.locale).toBe("vi")
      expect(mockSave).toHaveBeenCalled()
      expect(setUserLocale).toHaveBeenCalledWith("vi")
      expect(updatedUser?.locale).toBe("vi")
      expect(result.success).toBe(tSettingsBE("languageUpdated"))
      expect(result.error).toBeUndefined()

      vi.doUnmock("@/i18n/locale")
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const tSettingsBE = await getTranslations("settings.be")

      const result = await updateLocale("vi")

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tSettingsBE("languageUpdateFailed"))
    })
  })
})
