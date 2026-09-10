import type * as NextServer from "next/server"

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof NextServer>()
  return {
    ...actual,
    after: vi.fn((fn: () => void) => {
      fn()
    }),
  }
})

export {}
