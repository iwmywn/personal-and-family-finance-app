"use client"

import { useEffect, useRef } from "react"
import { useOffline } from "next/offline"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

export function OfflineIndicator() {
  const t = useExtracted()
  const isOffline = useOffline()
  const toastId = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    if (isOffline) {
      toastId.current = toast.error(
        t(
          "You are offline. Requests will be retried automatically when your connection is restored."
        ),
        {
          duration: Infinity,
        }
      )
    } else if (toastId.current !== undefined) {
      toast.dismiss(toastId.current)
      toastId.current = undefined
    }
  }, [t, isOffline])

  return null
}
