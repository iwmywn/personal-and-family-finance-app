import {
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

export const client = createAuthClient({
  plugins: [usernameClient(), inferAdditionalFields<typeof auth>()],
})
