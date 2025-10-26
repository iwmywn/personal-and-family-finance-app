"use client"

import { useEffect } from "react"

import { useUser } from "@/lib/swr"

interface LocaleProviderProps {
  children: React.ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const { user } = useUser()

  useEffect(() => {
    if (user?.locale) {
      // Set cookie từ user data
      document.cookie = `locale=${user.locale}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [user?.locale])

  return <>{children}</>
}
