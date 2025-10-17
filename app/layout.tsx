import type React from "react"
import type { Metadata } from "next"

import { nunito } from "@/app/fonts"

import "./globals.css"

import { Toaster } from "@/components/ui/sonner"
import { ProgressProvider } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    template: "%s | PFM",
    default: "PFM",
  },
  description: "Ứng dụng quản lý thu chi cá nhân Hoàng Anh Tuấn",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${nunito.className}`}>
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
