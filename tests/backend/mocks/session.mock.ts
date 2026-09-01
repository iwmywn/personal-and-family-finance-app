import {
  mockAdminUser,
  mockAnotherUser,
  mockSuperAdminUser,
  mockUser,
} from "@/tests/shared/data"

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

export const mockAuthenticatedAsAnotherUser = () => {
  mockGetCurrentSession.mockResolvedValue({
    user: {
      name: mockAnotherUser.name,
      email: mockAnotherUser.email,
      emailVerified: mockAnotherUser.emailVerified,
      image: mockAnotherUser.image,
      createdAt: mockAnotherUser.createdAt,
      updatedAt: mockAnotherUser.updatedAt,
      username: mockAnotherUser.username,
      displayUsername: mockAnotherUser.displayUsername,
      locale: mockAnotherUser.locale,
      currency: mockAnotherUser.currency,
      twoFactorEnabled: mockAnotherUser.twoFactorEnabled,
      id: mockAnotherUser._id.toString(),
    },
    session: {},
  })
}

export const mockAuthenticatedAdmin = () => {
  mockGetCurrentSession.mockResolvedValue({
    user: {
      name: mockAdminUser.name,
      email: mockAdminUser.email,
      emailVerified: mockAdminUser.emailVerified,
      image: mockAdminUser.image,
      createdAt: mockAdminUser.createdAt,
      updatedAt: mockAdminUser.updatedAt,
      username: mockAdminUser.username,
      displayUsername: mockAdminUser.displayUsername,
      locale: mockAdminUser.locale,
      currency: mockAdminUser.currency,
      twoFactorEnabled: mockAdminUser.twoFactorEnabled,
      role: mockAdminUser.role,
      id: mockAdminUser._id.toString(),
    },
    session: {},
  })
}

export const mockAuthenticatedSuperAdmin = () => {
  mockGetCurrentSession.mockResolvedValue({
    user: {
      name: mockSuperAdminUser.name,
      email: mockSuperAdminUser.email,
      emailVerified: mockSuperAdminUser.emailVerified,
      image: mockSuperAdminUser.image,
      createdAt: mockSuperAdminUser.createdAt,
      updatedAt: mockSuperAdminUser.updatedAt,
      username: mockSuperAdminUser.username,
      displayUsername: mockSuperAdminUser.displayUsername,
      locale: mockSuperAdminUser.locale,
      currency: mockSuperAdminUser.currency,
      twoFactorEnabled: mockSuperAdminUser.twoFactorEnabled,
      role: mockSuperAdminUser.role,
      id: mockSuperAdminUser._id.toString(),
    },
    session: {},
  })
}

export const mockUnauthenticatedUser = () => {
  mockGetCurrentSession.mockResolvedValue(null)
}
