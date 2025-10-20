import { vi } from "vitest"

export const mockVerifyRecaptchaToken = vi.fn()

export const setRecaptchaSuccess = (success = true) => {
  mockVerifyRecaptchaToken.mockResolvedValue(success)
}

export const clearRecaptchaMock = () => {
  mockVerifyRecaptchaToken.mockClear()
}
