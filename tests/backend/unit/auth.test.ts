import { getTranslations } from "next-intl/server"

import { insertTestUser } from "@/tests/backend/helpers/database"
import { mockUserCollectionError } from "@/tests/backend/mocks/collections.mock"
import {
  mockRecaptchaError,
  mockRecaptchaFailure,
  mockRecaptchaSuccess,
} from "@/tests/backend/mocks/recaptcha.mock"
import {
  mockAuthenticatedUser,
  mockSignOutFailure,
  mockSignOutSuccess,
  mockUnauthenticatedUser,
} from "@/tests/backend/mocks/session.mock"
import { mockUser, mockValidSignInValues } from "@/tests/shared/data"
import { getUser, signIn, signOut } from "@/actions/auth.actions"
import { setUserLocale } from "@/i18n/locale"
import { session } from "@/lib/session"

describe("Auth", async () => {
  const t = await getTranslations()

  describe("signIn", () => {
    it("should return error when recaptcha token is missing", async () => {
      const result = await signIn(mockValidSignInValues, null)

      expect(result.error).toBe(t("auth.be.recaptchaMissing"))
    })

    it("should return error with invalid input data", async () => {
      mockRecaptchaSuccess()

      const result = await signIn({ username: "", password: "" }, "valid-token")

      expect(result.error).toBe(t("common.be.invalidData"))
    })

    it("should return error when recaptcha verification fails", async () => {
      mockRecaptchaFailure()

      const result = await signIn(mockValidSignInValues, "invalid-token")

      expect(result.error).toBe(t("auth.be.recaptchaFailed"))
    })

    it("should return error when user does not exist", async () => {
      mockRecaptchaSuccess()

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(t("auth.be.signInError"))
    })

    it("should return error with incorrect password", async () => {
      await insertTestUser(mockUser)
      mockRecaptchaSuccess()

      const result = await signIn(
        { username: "testuser", password: "WrongPassword123!" },
        "valid-token"
      )

      expect(result.error).toBe(t("auth.be.signInError"))
    })

    it("should successfully sign in with valid credentials", async () => {
      await insertTestUser(mockUser)
      mockRecaptchaSuccess()

      vi.mock("@/i18n/locale", () => ({
        setUserLocale: vi.fn(),
      }))
      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(session.user.create).toHaveBeenCalledWith(mockUser._id.toString())
      expect(setUserLocale).toHaveBeenCalledWith(mockUser.locale)
      expect(result.error).toBeUndefined()

      vi.doUnmock("@/i18n/locale")
    })

    it("should return error when recaptcha verification throws error", async () => {
      mockRecaptchaError()

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(t("auth.be.signInFailed"))
    })

    it("should return error when database operation throws error", async () => {
      mockRecaptchaSuccess()
      mockUserCollectionError()

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(t("auth.be.signInFailed"))
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSignOutSuccess()

      const result = await signOut()

      expect(session.user.delete).toHaveBeenCalled()
      expect(result.success).toBe(t("auth.be.signOutSuccess"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when sign out fails", async () => {
      mockSignOutFailure()

      const result = await signOut()

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(t("auth.be.signOutFailed"))
    })
  })

  describe("getUser", () => {
    it("should return error when user is not authenticated", async () => {
      mockUnauthenticatedUser()

      const result = await getUser("", t)

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(t("common.be.accessDenied"))
    })

    it("should return error when user not found in database", async () => {
      mockAuthenticatedUser()

      const result = await getUser(mockUser._id.toString(), t)

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(t("common.be.userNotFound"))
    })

    it("should return user data when authenticated", async () => {
      await insertTestUser(mockUser)
      mockAuthenticatedUser()

      const result = await getUser(mockUser._id.toString(), t)

      expect(result.user).toBeDefined()
      expect(result.user?.fullName).toBe("Test User")
      expect(result.user?.username).toBe("testuser")
      expect(result.error).toBeUndefined()
    })

    it("should return error when database operation throws error", async () => {
      mockAuthenticatedUser()
      mockUserCollectionError()

      const result = await getUser(mockUser._id.toString(), t)

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(t("auth.be.userFetchFailed"))
    })
  })
})
