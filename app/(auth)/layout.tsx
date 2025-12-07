"use client"

import { useTheme } from "next-themes"

import { Particles } from "@/components/particles"
import { useMounted } from "@/hooks/use-mounted"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()

  const isDark = resolvedTheme === "dark"

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-10">
      {mounted && (
        <Particles
          color={isDark ? "#ffffff" : "#000000"}
          particleCount={25000}
          particleSize={5}
          animate={false}
          className={`absolute z-9 ${isDark ? "bg-black" : "bg-white"}`}
        />
      )}

      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </main>
  )
}
