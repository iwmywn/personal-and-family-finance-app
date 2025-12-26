import { mockUser } from "@/tests/shared/data"

const mockGetCurrentSession = vi.fn()

vi.mock("@/actions/session.actions", () => ({
  getCurrentSession: mockGetCurrentSession,
}))

export const mockAuthenticatedUser = () => {
  mockGetCurrentSession.mockResolvedValue({
    user: {
      name: mockUser.name,
      email: mockUser.email,
      emailVerified: mockUser.emailVerified,
      image: mockUser.image,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      username: mockUser.username,
      displayUsername: mockUser.displayUsername,
      locale: mockUser.locale,
      currency: mockUser.currency,
      twoFactorEnabled: mockUser.twoFactorEnabled,
      id: mockUser._id.toString(),
    },
    session: {},
  })
}

export const mockUnauthenticatedUser = () => {
  mockGetCurrentSession.mockResolvedValue(null)
}
