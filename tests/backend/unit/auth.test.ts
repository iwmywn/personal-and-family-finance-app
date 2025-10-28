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
import { getUser, signIn, signOut } from "@/actions/auth"

describe("Auth", () => {
  describe("signIn", () => {
    it("should return error when recaptcha token is missing", async () => {
      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(mockValidSignInValues, null)

      expect(result.error).toBe(tAuthBE("recaptchaMissing"))
    })

    it("should return error with invalid input data", async () => {
      mockRecaptchaSuccess()

      const tCommonBE = await getTranslations("common.be")

      const result = await signIn({ username: "", password: "" }, "valid-token")

      expect(result.error).toBe(tCommonBE("invalidData"))
    })

    it("should return error when recaptcha verification fails", async () => {
      mockRecaptchaFailure()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(mockValidSignInValues, "invalid-token")

      expect(result.error).toBe(tAuthBE("recaptchaFailed"))
    })

    it("should return error when user does not exist", async () => {
      mockRecaptchaSuccess()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(tAuthBE("signInError"))
    })

    it("should return error with incorrect password", async () => {
      await insertTestUser(mockUser)
      mockRecaptchaSuccess()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(
        { username: "testuser", password: "WrongPassword123!" },
        "valid-token"
      )

      expect(result.error).toBe(tAuthBE("signInError"))
    })

    it("should successfully sign in with valid credentials", async () => {
      await insertTestUser(mockUser)
      mockRecaptchaSuccess()

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBeUndefined()
    })

    it("should return error when recaptcha verification throws error", async () => {
      mockRecaptchaError()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(tAuthBE("signInFailed"))
    })

    it("should return error when database operation throws error", async () => {
      mockRecaptchaSuccess()
      mockUserCollectionError()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signIn(mockValidSignInValues, "valid-token")

      expect(result.error).toBe(tAuthBE("signInFailed"))
    })
  })

  describe("signOut", () => {
    it("should successfully sign out", async () => {
      mockSignOutSuccess()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signOut()

      expect(result.success).toBe(tAuthBE("signOutSuccess"))
      expect(result.error).toBeUndefined()
    })

    it("should return error when sign out fails", async () => {
      mockSignOutFailure()

      const tAuthBE = await getTranslations("auth.be")

      const result = await signOut()

      expect(result.success).toBeUndefined()
      expect(result.error).toBe(tAuthBE("signOutFailed"))
    })
  })

  describe("getUser", () => {
    it("should return error when user is not authenticated", async () => {
      mockUnauthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(tCommonBE("accessDenied"))
    })

    it("should return error when user not found in database", async () => {
      mockAuthenticatedUser()

      const tCommonBE = await getTranslations("common.be")

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(tCommonBE("userNotFound"))
    })

    it("should return user data when authenticated", async () => {
      await insertTestUser(mockUser)
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

      const tAuthBE = await getTranslations("auth.be")

      const result = await getUser()

      expect(result.user).toBeUndefined()
      expect(result.error).toBe(tAuthBE("userFetchFailed"))
    })
  })
})
