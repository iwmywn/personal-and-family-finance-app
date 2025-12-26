import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getExtracted, getLocale } from "next-intl/server"

import { nunito } from "@/app/fonts"

import "./globals.css"

import { Suspense } from "react"

import { Toaster } from "@/components/ui/sonner"
import { Logo } from "@/components/logo"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { env } from "@/env/client.mjs"
import { siteConfig } from "@/app/pffa.config"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getExtracted()

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: siteConfig.name,
    },
    description: t("Personal & Family Finance App"),
    authors: [
      {
        name: "iwmywn",
        url: "https://iwmywn.github.io",
      },
    ],
    creator: "iwmywn",
    openGraph: {
      type: "website",
      locale: locale,
      url: env.NEXT_PUBLIC_URL,
      title: siteConfig.name,
      description: t("Personal & Family Finance App"),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: t("Personal & Family Finance App"),
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
