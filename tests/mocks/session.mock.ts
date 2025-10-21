import { vi } from "vitest"

export const mockSession = {
  user: {
    get: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}
