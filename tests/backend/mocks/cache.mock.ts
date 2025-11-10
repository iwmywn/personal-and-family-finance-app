vi.mock("next/cache", () => ({
  cacheTag: vi.fn((_tag: string) => {
    // no-op
  }),
  updateTag: vi.fn((_tag: string) => {
    // no-op
  }),
}))
