import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"

import { nunito } from "@/app/fonts"

import "./globals.css"

import { Suspense } from "react"
import { LOCALE_CONFIG, type AppLocale } from "@/i18n/config"

import { Toaster } from "@/components/ui/sonner"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/app/pffa.config"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale
  const tCommonFE = await getTranslations("common.fe")

  return {
    title: {
      template: `%s | ${siteConfig.name}`,
      default: siteConfig.name,
    },
    description: tCommonFE("appDescription"),
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
      url: process.env.NEXT_PUBLIC_URL,
      title: siteConfig.name,
      description: tCommonFE("appDescription"),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: tCommonFE("appDescription"),
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
    <Suspense fallback={null}>
      <Layout>{children}</Layout>
    </Suspense>
  )
}

async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [messages, locale] = await Promise.all([getMessages(), getLocale()])

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${nunito.className}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProgressProvider>
              <Toaster richColors closeButton />
              {children}
            </ProgressProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
