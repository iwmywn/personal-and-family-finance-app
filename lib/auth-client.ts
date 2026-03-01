import {
  inferAdditionalFields,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

export const client = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect() {
        const url = new URL(window.location.href)
        const callbackUrl = url.searchParams.get("next") || "/home"
        const target = new URL("/two-factor", window.location.origin)
        target.searchParams.set("next", callbackUrl)
        window.location.href = `${target.pathname}${target.search}`
      },
    }),
    usernameClient(),
  ],
})
