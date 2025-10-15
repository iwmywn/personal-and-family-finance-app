"use client"

import { Button } from "@/components/ui/button"
import { nunito } from "@/app/fonts"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className={`${nunito.className}`}>
        <main className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center md:px-16">
          <h2 className="text-lg font-semibold">Đã xảy ra lỗi!</h2>
          <p>{error.message}</p>
          <Button onClick={() => reset()}>Thử lại</Button>
        </main>
      </body>
    </html>
  )
}
