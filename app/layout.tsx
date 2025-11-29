import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getExtracted, getLocale } from "next-intl/server"

import { nunito } from "@/app/fonts"

import "./globals.css"

import { Suspense } from "react"
import Image from "next/image"

import { Toaster } from "@/components/ui/sonner"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { env } from "@/env/client.mjs"
import { LOCALE_CONFIG } from "@/i18n/config"
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
      locale: LOCALE_CONFIG[locale].intlLocale,
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
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${nunito.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressProvider>
            <Suspense
              fallback={
                <div className="center h-screen">
                  <Image
                    src="/images/logo.png"
                    alt={`${siteConfig.name} Logo`}
                    width={32}
                    height={32}
                    aria-label="Loading"
                    className="animate-spin"
                  />
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
