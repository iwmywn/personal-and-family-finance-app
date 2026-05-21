import { getLocale } from "next-intl/server"

import { ReCaptchaProvider } from "@/components/layout/recaptcha-provider"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <ReCaptchaProvider language={locale}>
      <main className="flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </ReCaptchaProvider>
  )
}
