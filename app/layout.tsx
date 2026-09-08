import "./globals.css"

import { Suspense } from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getExtracted, getLocale } from "next-intl/server"

import { nunito } from "@/app/fonts"
import { siteConfig } from "@/app/pffa.config"
import { Toaster } from "@/components/ui/sonner"
import { ClientLang } from "@/components/layout/client-lang"
import { OfflineIndicator } from "@/components/layout/offline-indicator"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Logo } from "@/components/logo"
import { SchemaMessagesProvider } from "@/context/schema-messages-context"
import { clientEnv } from "@/env/client"
import { getSchemaMessages } from "@/schemas/messages"

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getExtracted()])
  const { name } = siteConfig
  const description = t("Personal & Family Finance App")

  return {
    metadataBase: new URL(clientEnv.NEXT_PUBLIC_URL),
    title: {
      template: `%s | ${name}`,
      default: name,
    },
    description,
    authors: [
      {
        name: "iwmywn",
        url: "https://iwmywn.github.io",
      },
    ],
    creator: "iwmywn",
    openGraph: {
      type: "website",
      locale,
      url: clientEnv.NEXT_PUBLIC_URL,
      title: name,
      description,
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      creator: "@ctcuasaunay",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi-VN"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={nunito.className}
    >
      <body>
        <ThemeProvider>
          <Suspense
            fallback={
              <div className="center h-screen">
                <Logo isLoading />
              </div>
            }
          >
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const schemaMessages = await getSchemaMessages()

  return (
    <NextIntlClientProvider>
      <SchemaMessagesProvider messages={schemaMessages}>
        <ClientLang />
        <OfflineIndicator />
        <Toaster richColors closeButton />
        <Suspense
          fallback={
            <div className="center h-screen">
              <Logo isLoading />
            </div>
          }
        >
          {children}
        </Suspense>
      </SchemaMessagesProvider>
    </NextIntlClientProvider>
  )
}
