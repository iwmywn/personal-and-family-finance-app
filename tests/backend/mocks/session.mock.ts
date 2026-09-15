import {
  mockDBAdminUser,
  mockDBAnotherUser,
  mockDBUser,
} from "@/tests/shared/data"

const mockGetSession = vi.fn()

vi.mock("@/actions/session.actions", () => ({
  getSession: mockGetSession,
}))

export const mockAuthenticatedUser = () => {
  mockGetSession.mockImplementation(async (requireAdmin = false) => {
    if (requireAdmin) {
      return { error: "Access denied! Admin privileges required." }
    }
    return {
      user: {
        ...mockDBUser,
        id: mockDBUser._id.toString(),
      },
      session: {},
    }
  })
}

export const mockAuthenticatedAsAnotherUser = () => {
  mockGetSession.mockImplementation(async (requireAdmin = false) => {
    if (requireAdmin) {
      return { error: "Access denied! Admin privileges required." }
    }
    return {
      user: {
        ...mockDBAnotherUser,
        id: mockDBAnotherUser._id.toString(),
      },
      session: {},
    }
  })
}

export const mockAuthenticatedAdmin = () => {
  mockGetSession.mockResolvedValue({
    user: {
      ...mockDBAdminUser,
      id: mockDBAdminUser._id.toString(),
    },
    session: {},
  })
}

export const mockUnauthenticatedUser = () => {
  mockGetSession.mockResolvedValue({
    error: "Access denied! Please refresh the page and try again.",
  })
}
