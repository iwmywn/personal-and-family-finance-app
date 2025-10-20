import { vi } from "vitest"

export const mockSession = {
  user: {
    get: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}

export const createMockSession = (userId: string) => {
  const id = userId
  mockSession.user.get.mockResolvedValue({ userId: id })
  return id
}

export const clearMockSession = () => {
  mockSession.user.get.mockClear()
  mockSession.user.create.mockClear()
  mockSession.user.delete.mockClear()
}
