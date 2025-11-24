import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"

import { env as clientEnv } from "@/env/client.mjs"
import { env as serverEnv } from "@/env/server.mjs"
import { connect } from "@/lib/db"
import { siteConfig } from "@/app/pffa.config"

export const auth = betterAuth({
  database: mongodbAdapter(await connect()),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    modelName: "users",
    additionalFields: {
      locale: {
        type: "string",
        required: false,
        defaultValue: "vi",
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  plugins: [username(), nextCookies()],
  advanced: {
    cookiePrefix: siteConfig.name,
    database: {
      generateId: false,
    },
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [clientEnv.NEXT_PUBLIC_URL],
})

export type Session = typeof auth.$Infer.Session
