import {
  adminClient,
  inferAdditionalFields,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    inferAdditionalFields<typeof auth>(),
    twoFactorClient(),
    usernameClient(),
  ],
})
