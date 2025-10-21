const mockVerifyRecaptchaToken = vi.fn()

vi.mock("@/lib/recaptcha", () => ({
  verifyRecaptchaToken: mockVerifyRecaptchaToken,
}))

export const mockRecaptchaSuccess = () => {
  mockVerifyRecaptchaToken.mockResolvedValue(true)
}

export const mockRecaptchaFailure = () => {
  mockVerifyRecaptchaToken.mockResolvedValue(false)
}

export const mockRecaptchaError = (
  error: Error = new Error("Recaptcha verification error")
) => {
  mockVerifyRecaptchaToken.mockRejectedValue(error)
}
