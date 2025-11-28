vi.mock("next-intl/server", async () => ({
  ...(await vi.importActual("next-intl/server")),
  getExtracted: vi.fn(() => {
    return vi.fn((message: string) => message)
  }),
}))

export {}
