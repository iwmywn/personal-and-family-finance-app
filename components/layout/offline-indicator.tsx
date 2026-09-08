"use client"

import { useEffect, useRef } from "react"
import { useOffline } from "next/offline"
import { useExtracted } from "next-intl"
import { toast } from "sonner"

export function OfflineIndicator() {
  const t = useExtracted()
  const offline = useOffline()
  const toastId = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    if (offline) {
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
  }, [t, offline])

  return null
}
