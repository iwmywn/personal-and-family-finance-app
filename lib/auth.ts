import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { captcha, username } from "better-auth/plugins"

import { env as clientEnv } from "@/env/client.mjs"
import { env as serverEnv } from "@/env/server.mjs"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { connect } from "@/lib/db"
import { siteConfig } from "@/app/pffa.config"

export const auth = betterAuth({
  appName: siteConfig.name,
  database: mongodbAdapter(await connect()),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  user: {
    modelName: "users",
    additionalFields: {
      locale: {
        type: "string",
        required: true,
        defaultValue: DEFAULT_LOCALE,
      },
    },
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: "accounts",
  },
  plugins: [
    username(),
    nextCookies(),
    captcha({
      provider: "google-recaptcha",
      secretKey: serverEnv.RECAPTCHA_SECRET,
      endpoints: ["/sign-in/username"],
    }),
  ],
  advanced: {
    cookiePrefix: siteConfig.name,
    database: {
      generateId: false,
    },
  },
  secret: serverEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [clientEnv.NEXT_PUBLIC_URL],
})
