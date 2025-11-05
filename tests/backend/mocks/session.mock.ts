import { mockUser } from "@/tests/shared/data"

const mockSession = {
  user: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock("@/lib/session", () => ({ session: mockSession }))

export const mockAuthenticatedUser = (
  userId: string = mockUser._id.toString()
) => {
  mockSession.user.get.mockResolvedValue({ userId })
}

export const mockUnauthenticatedUser = () => {
  mockSession.user.get.mockResolvedValue({ userId: null })
}

export const mockSignOutSuccess = () => {
  mockSession.user.delete.mockResolvedValue(undefined)
}

export const mockSignOutFailure = (
  error: Error = new Error("Session error")
) => {
  mockSession.user.delete.mockRejectedValue(error)
}
