import type React from "react"
import type { Metadata } from "next"

import { montserrat } from "@/app/fonts"

import "./globals.css"

import { Toaster } from "@/components/ui/sonner"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    template: "%s | iwmywn - pfm",
    default: "iwmywn - pfm",
  },
  description: "iwmywn personal income and expense management application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className}`}>
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
      </body>
    </html>
  )
}
