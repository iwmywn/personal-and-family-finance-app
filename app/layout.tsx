import "./globals.css"

import { Suspense } from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getExtracted, getLocale } from "next-intl/server"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { nunito } from "@/app/fonts"
import { siteConfig } from "@/app/pffa.config"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProgressProvider } from "@/components/layout/progress-provider"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Logo } from "@/components/logo"
import { SchemaMessagesProvider } from "@/context/schema-messages-context"
import { clientEnv } from "@/env/client.mjs"
import { getSchemaMessages } from "@/schemas/messages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getExtracted()

  const { name } = siteConfig
  const description = t("Personal & Family Finance App")

  return {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense
      fallback={
        <html lang="vi-VN">
          <body>
            <ThemeProvider>
              <div className="center h-screen">
                <Logo isLoading />
              </div>
            </ThemeProvider>
          </body>
        </html>
      }
    >
      <AppLayout>{children}</AppLayout>
    </Suspense>
  )
}

async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [locale, schemaMessages] = await Promise.all([
    getLocale(),
    getSchemaMessages(),
  ])

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={nunito.className}
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>
            <ProgressProvider>
              <SchemaMessagesProvider messages={schemaMessages}>
                <NuqsAdapter>
                  <TooltipProvider>
                    <Suspense
                      fallback={
                        <div className="center h-screen">
                          <Logo isLoading />
                        </div>
                      }
                    >
                      <Toaster richColors closeButton />
                      {children}
                    </Suspense>
                  </TooltipProvider>
                </NuqsAdapter>
              </SchemaMessagesProvider>
            </ProgressProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
