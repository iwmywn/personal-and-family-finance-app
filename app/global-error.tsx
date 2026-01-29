"use client"

import { nunito } from "@/app/fonts"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en-US" className={nunito.className}>
      <body>
        <main className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center md:px-16">
          <h2 className="text-lg font-semibold">Something went wrong!</h2>
          <p>{error.message}</p>
          <Button onClick={() => reset()}>Try again</Button>
        </main>
      </body>
    </html>
  )
}
