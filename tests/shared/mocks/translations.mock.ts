import { createTranslator } from "next-intl"

vi.mock("next-intl/server", async () => ({
  ...(await vi.importActual("next-intl/server")),
  getTranslations: vi.fn(async (namespace?: string) => {
    const locale = "vi"
    const messages = (await import(`../../../messages/${locale}.json`)).default

    return createTranslator({
      locale,
      messages,
      namespace,
    })
  }),
}))

export {}
