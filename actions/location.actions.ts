"use server"

import { cacheLife, cacheTag } from "next/cache"

import { getCurrentSession } from "./session.actions"

export async function getLocationFromIP(ipAddress: string | null | undefined) {
  "use cache: remote"
  cacheTag(`location-${ipAddress}`)
  cacheLife({ expire: 120 })

  const session = await getCurrentSession()
  if (!session) return null

  if (!ipAddress) return null
  if (ipAddress === "0000:0000:0000:0000:0000:0000:0000:0000") {
    return "Local"
  }

  try {
    const response = await fetch(
      `https://ip-api.com/json/${encodeURIComponent(ipAddress)}?fields=status,regionName,country`
    )
    if (!response.ok) return null
    const data = await response.json()

    if (data.status === "success") {
      const parts: string[] = []
      if (data.regionName) parts.push(data.regionName)
      if (data.country) parts.push(data.country)

      return parts.length > 0 ? parts.join(", ") : null
    }

    return null
  } catch (error) {
    console.error("Error fetching location from IP: ", error)
    return null
  }
}
