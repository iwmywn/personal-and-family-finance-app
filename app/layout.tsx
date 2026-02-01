import "./globals.css"

import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getExtracted, getLocale } from "next-intl/server"

import { nunito } from "@/app/fonts"
import { siteConfig } from "@/app/pffa.config"
import { Toaster } from "@/components/ui/sonner"
import { Logo } from "@/components/logo"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { env } from "@/env/client.mjs"

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
      url: env.NEXT_PUBLIC_URL,
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
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={nunito.className}
    >
      <body>
        <ThemeProvider>
          <ProgressProvider>
            <Suspense
              fallback={
                <div className="center h-screen">
                  <Logo isLoading />
                </div>
              }
            >
              <NextIntlClientProvider>
                <Toaster richColors closeButton />
                {children}
              </NextIntlClientProvider>
            </Suspense>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
