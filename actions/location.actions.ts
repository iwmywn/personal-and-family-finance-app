"use server"

import { isIP } from "node:net"
import { cacheLife, cacheTag } from "next/cache"

export async function getLocationFromIP(ipAddress: string | null | undefined) {
  "use cache: remote"
  cacheTag(`location-${ipAddress}`)
  cacheLife({ expire: 120 })

  if (!ipAddress) return null
  if (
    ipAddress === "0000:0000:0000:0000:0000:0000:0000:0000" ||
    ipAddress === "::1" ||
    ipAddress === "127.0.0.1"
  ) {
    return "Local"
  }

  if (!isIP(ipAddress)) return null

  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ipAddress)}`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!response.ok) return null
    const data = await response.json()

    if (data.success) {
      const parts: string[] = []
      if (data.region) parts.push(data.region)
      if (data.country) parts.push(data.country)

      return parts.length > 0 ? parts.join(", ") : null
    }

    return null
  } catch (error) {
    console.error("Error fetching location from IP: ", error)
    return null
  }
}
